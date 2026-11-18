"use client"

// json-render catalog + registry for one quiz question. Every question is a
// JSON spec (flat element map) rendered by <Renderer>, so the model or a
// generator can describe any question layout with these building blocks.

import { defineCatalog } from "@json-render/core"
import { schema } from "@json-render/react/schema"
import { defineRegistry, Renderer, StateProvider, ActionProvider, VisibilityProvider } from "@json-render/react"
import { z } from "zod"

export const catalog = defineCatalog(schema, {
  components: {
    Stack: { props: z.object({}), description: "Vertical container" },
    Picture: { props: z.object({ src: z.string(), credit: z.string(), href: z.string() }), description: "Photo with license credit" },
    Prompt: { props: z.object({ text: z.string() }), description: "The question" },
    Options: { props: z.object({}), description: "Grid of answer buttons" },
    Option: { props: z.object({ label: z.string(), state: z.enum(["idle", "right", "wrong", "dim"]) }), description: "Answer button" },
  },
  actions: { choose: { description: "Pick an answer" } },
})

const cls = { idle: "bg-sky-100 hover:bg-sky-200", right: "bg-emerald-400 text-white", wrong: "bg-red-400 text-white", dim: "bg-slate-100 opacity-60" }

export const { registry } = defineRegistry(catalog, {
  components: {
    Stack: ({ children }) => <div className="space-y-4">{children}</div>,
    Picture: ({ props }) => (
      <figure>
        <img src={props.src} alt="" className="mx-auto max-h-72 w-full rounded-xl object-contain bg-slate-100" />
        <figcaption className="mt-1 text-right text-[10px] text-slate-400">
          <a href={props.href} target="_blank" rel="noreferrer">{props.credit}</a>
        </figcaption>
      </figure>
    ),
    Prompt: ({ props }) => <h2 className="text-2xl font-bold">{props.text}</h2>,
    Options: ({ children }) => <div className="grid gap-2 sm:grid-cols-2">{children}</div>,
    Option: ({ props, emit }) => (
      <button onClick={() => emit("press")} className={`rounded-xl px-4 py-3 font-semibold transition active:scale-95 ${cls[props.state]}`}>
        {props.label}
      </button>
    ),
  },
  actions: { choose: async () => {} },
})

export type QSpec = { root: string; elements: Record<string, any> }

export function QuestionView({ spec, onChoose }: { spec: QSpec; onChoose: (v: string) => void }) {
  return (
    <StateProvider initialState={{}}>
      <VisibilityProvider>
        <ActionProvider handlers={{ choose: async (p: any) => onChoose(String(p?.value)) }}>
          <Renderer spec={spec as any} registry={registry} />
        </ActionProvider>
      </VisibilityProvider>
    </StateProvider>
  )
}
