"use client";

import { useSyncExternalStore } from "react";

import { SAMPLE_COMPANY_PROFILE, agentTypeDefaults, toolsForTasks } from "@/lib/catalog";
import type { Assistant, AgentTypeId } from "@/lib/types";

/**
 * Assistants live in localStorage until there's a backend. Kept as a module
 * level external store so the whole app reads one copy - swapping this for
 * fetch calls later shouldn't touch any component.
 */

const STORAGE_KEY = "aarya.assistants.v2";
const EMPTY: Assistant[] = [];

let state: Assistant[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export interface NewAssistantInput {
  name: string;
  agentType: AgentTypeId;
  companyName?: string;
  companyProfile?: string;
  tasks?: string[];
}

function createAssistant(input: NewAssistantInput): Assistant {
  const now = new Date().toISOString();
  const defaults = agentTypeDefaults(input.agentType);
  const tasks = input.tasks ?? defaults.tasks;

  return {
    id: newId(),
    name: input.name,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    ...defaults,
    companyName: input.companyName ?? defaults.companyName,
    companyProfile: input.companyProfile ?? defaults.companyProfile,
    tasks,
    tools: toolsForTasks(tasks),
  };
}

function seed(): Assistant[] {
  const reception = createAssistant({
    name: "Scalina Media · Reception",
    agentType: "english",
    companyName: "Scalina Media",
    companyProfile: SAMPLE_COMPANY_PROFILE,
    tasks: ["answer_questions", "book_appointments", "collect_contact"],
  });
  const nepaliLine = createAssistant({
    name: "Scalina Media · नेपाली लाइन",
    agentType: "nepali",
    companyName: "Scalina Media",
    companyProfile: SAMPLE_COMPANY_PROFILE,
    tasks: ["answer_questions", "take_messages"],
  });
  return [{ ...reception, status: "published" }, nepaliLine];
}

function emit() {
  for (const listener of listeners) listener();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing or a full quota - the UI still works for this session.
  }
}

function hydrate() {
  hydrated = true;
  let stored: Assistant[] | null = null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    stored = raw ? (JSON.parse(raw) as Assistant[]) : null;
  } catch {
    stored = null;
  }
  state = stored ?? seed();
  // Write the seed straight back so ids stay stable across reloads.
  if (!stored) persist();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!hydrated) hydrate();
  return () => {
    listeners.delete(listener);
  };
}

function commit(next: Assistant[]) {
  state = next;
  persist();
  emit();
}

function touch(assistant: Assistant, patch: Partial<Assistant>): Assistant {
  return { ...assistant, ...patch, updatedAt: new Date().toISOString() };
}

export function addAssistant(input: NewAssistantInput) {
  const assistant = createAssistant(input);
  commit([assistant, ...state]);
  return assistant;
}

export function updateAssistant(id: string, patch: Partial<Assistant>) {
  commit(state.map((assistant) => (assistant.id === id ? touch(assistant, patch) : assistant)));
}

export function duplicateAssistant(id: string) {
  const source = state.find((assistant) => assistant.id === id);
  if (!source) return undefined;
  const now = new Date().toISOString();
  const copy: Assistant = {
    ...structuredClone(source),
    id: newId(),
    name: `${source.name} (copy)`,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
  commit([copy, ...state]);
  return copy;
}

export function removeAssistant(id: string) {
  commit(state.filter((assistant) => assistant.id !== id));
}

export function useStore() {
  const assistants = useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  );
  const ready = useSyncExternalStore(
    subscribe,
    () => hydrated,
    () => false,
  );

  return {
    assistants,
    hydrated: ready,
    add: addAssistant,
    update: updateAssistant,
    duplicate: duplicateAssistant,
    remove: removeAssistant,
  };
}
