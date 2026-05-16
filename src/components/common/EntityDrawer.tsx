import { X } from "lucide-react";
import { activeJourneys, adminEvents, approvals, dataProducts, getApproval, getEvent, getJourney, getProduct, getSemantic, getStudio, recommendations, semanticAssets, studioSessions } from "../../data/mockData";
import type { DrawerEntity } from "../../types";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";

export default function EntityDrawer({ entity, onClose, onNavigate }: { entity: DrawerEntity | null; onClose: () => void; onNavigate: (entity: DrawerEntity) => void }) {
  if (!entity) return null;
  const source =
    entity.type === "product" ? getProduct(entity.id) :
    entity.type === "semantic" ? getSemantic(entity.id) :
    entity.type === "studio" ? getStudio(entity.id) :
    entity.type === "journey" ? getJourney(entity.id) :
    entity.type === "event" ? getEvent(entity.id) :
    getApproval(entity.id);

  if (!source) return null;
  const related = entity.type === "event" ? { type: (source as ReturnType<typeof getEvent>)?.relatedEntityType, id: (source as ReturnType<typeof getEvent>)?.relatedEntityId } : entity.type === "approval" ? { type: (source as ReturnType<typeof getApproval>)?.relatedEntityType, id: (source as ReturnType<typeof getApproval>)?.relatedEntityId } : null;
  const display = related?.type === "product" ? getProduct(related.id ?? "") : related?.type === "semantic" ? getSemantic(related.id ?? "") : null;
  const target = display ?? source;
  const anyTarget = target as any;
  const title = anyTarget.name ?? anyTarget.title;
  const description = anyTarget.description ?? "";
  const status = anyTarget.status ?? anyTarget.severity;
  const owner = anyTarget.owner ?? anyTarget.actor ?? anyTarget.requestedBy;
  const domain = anyTarget.domain ?? "Platform";
  const productLinks = (anyTarget.linkedDataProducts ?? anyTarget.linkedDataProduct ? [anyTarget.linkedDataProduct] : anyTarget.linkedDataProducts ?? []).filter(Boolean);
  const semanticLinks = anyTarget.linkedSemanticAssets ?? [];
  const studioLinks = anyTarget.linkedStudioSessions ?? [];
  const journeyLinks = anyTarget.linkedJourneys ?? [];
  const activity = adminEvents.filter((event) => event.relatedEntityId === anyTarget.id).slice(0, 3);
  const recs = recommendations.filter((rec) => rec.relatedEntityId === anyTarget.id).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/20" onClick={onClose}>
      <aside onClick={(event) => event.stopPropagation()} className="absolute right-0 top-0 h-full w-[480px] overflow-y-auto bg-white p-6 shadow-2xl scrollbar-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">{entity.type}</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">{title}</h2>
            <div className="mt-3 flex flex-wrap gap-2">{status ? <StatusBadge status={status} /> : null}<span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{domain}</span></div>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Info label="Owner" value={owner ?? "DataNexus"} />
          <Info label="Updated" value={anyTarget.lastUpdated ?? anyTarget.timestamp ?? "Just now"} />
          <Info label="Quality / Coverage" value={anyTarget.qualityScore ? `${anyTarget.qualityScore}%` : anyTarget.coverage ? `${anyTarget.coverage}%` : "N/A"} />
          <Info label="Version / Stage" value={anyTarget.version ?? anyTarget.stage ?? anyTarget.eventType ?? anyTarget.type ?? "N/A"} />
        </div>
        {typeof anyTarget.progress === "number" ? <section className="mt-6"><h3 className="mb-3 text-sm font-bold text-slate-900">Progress</h3><ProgressBar value={anyTarget.progress} /></section> : null}
        {anyTarget.consumptionMethods ? <section className="mt-6"><h3 className="mb-3 text-sm font-bold text-slate-900">Consumption Options</h3><div className="flex flex-wrap gap-2">{anyTarget.consumptionMethods.map((method: string) => <span key={method} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">{method}</span>)}</div></section> : null}
        <LinkSection title="Linked Data Products" ids={productLinks} lookup={(id) => dataProducts.find((x) => x.id === id)} type="product" onNavigate={onNavigate} />
        <LinkSection title="Linked Semantic Assets" ids={semanticLinks} lookup={(id) => semanticAssets.find((x) => x.id === id)} type="semantic" onNavigate={onNavigate} />
        <LinkSection title="Related Studio Sessions" ids={studioLinks} lookup={(id) => studioSessions.find((x) => x.id === id)} type="studio" onNavigate={onNavigate} />
        <LinkSection title="Related Journeys" ids={journeyLinks} lookup={(id) => activeJourneys.find((x) => x.id === id)} type="journey" onNavigate={onNavigate} />
        {activity.length ? <section className="mt-6"><h3 className="mb-3 text-sm font-bold text-slate-900">Recent Activity</h3><div className="space-y-2">{activity.map((item) => <button key={item.id} onClick={() => onNavigate({ type: "event", id: item.id })} className="w-full rounded-lg border border-slate-100 p-3 text-left text-xs hover:border-orange-200"><b>{item.title}</b><span className="block text-slate-500">{item.timestamp} by {item.actor}</span></button>)}</div></section> : null}
        {recs.length ? <section className="mt-6"><h3 className="mb-3 text-sm font-bold text-slate-900">Recommended Next Actions</h3><div className="space-y-2">{recs.map((rec) => <div key={rec.id} className="rounded-lg border border-orange-100 bg-orange-50/40 p-3 text-xs"><b>{rec.title}</b><span className="block text-slate-600">{rec.description}</span></div>)}</div></section> : null}
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 text-sm font-bold text-slate-900">{value}</div></div>;
}

function LinkSection({ title, ids, lookup, type, onNavigate }: { title: string; ids: string[]; lookup: (id: string) => any; type: "product" | "semantic" | "studio" | "journey"; onNavigate: (entity: DrawerEntity) => void }) {
  const items = ids.map(lookup).filter(Boolean);
  if (!items.length) return null;
  return <section className="mt-6"><h3 className="mb-3 text-sm font-bold text-slate-900">{title}</h3><div className="space-y-2">{items.map((item) => <button key={item.id} onClick={() => onNavigate({ type, id: item.id } as DrawerEntity)} className="flex w-full items-center justify-between rounded-lg border border-slate-100 p-3 text-left text-xs hover:border-orange-200 hover:bg-orange-50/40"><span><b>{item.name}</b><span className="block text-slate-500">{item.domain ?? item.studioType}</span></span><StatusBadge status={item.status} /></button>)}</div></section>;
}
