import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchAssets } from "../api/client";
import axios from "axios";
import { Asset } from "../types";
import { HealthBar, StatusBadge, Table, TR, TD, Panel, Spinner, EmptyState, SyntheticBadge } from "../components/shared";
import { PageHeader, Btn } from "../components/PageHeader";

function riskColor(p: number) {
  return p >= 0.65 ? "#ef4444" : p >= 0.45 ? "#f59e0b" : p >= 0.25 ? "#a78bfa" : "#4ade80";
}

// ── Add Asset Modal ──────────────────────────────────────────────────
const EMPTY_FORM = {
  id: "", name: "", type: "transformer", substation: "", region: "",
  latitude: "29.76", longitude: "-95.36",
  installation_year: new Date().getFullYear().toString(),
  rated_capacity_kva: "1000", health_score: "85", failure_probability: "0.10",
  impact_score: "50", customers_affected: "0",
  critical_facilities: "", age_years: "5",
  last_maintenance_days: "30", fault_history: "0",
};

function AddAssetModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (!form.id || !form.name || !form.substation || !form.region) {
      setError("ID, Name, Substation and Region are required."); return;
    }
    setSaving(true);
    try {
      await axios.post("/api/assets", {
        id: form.id.toUpperCase().trim(),
        name: form.name.trim(),
        type: form.type,
        substation: form.substation.trim(),
        region: form.region.trim(),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        installation_year: parseInt(form.installation_year),
        rated_capacity_kva: parseInt(form.rated_capacity_kva),
        health_score: parseFloat(form.health_score),
        failure_probability: parseFloat(form.failure_probability),
        impact_score: parseInt(form.impact_score),
        customers_affected: parseInt(form.customers_affected),
        critical_facilities: form.critical_facilities.split(",").map(s => s.trim()).filter(Boolean),
        age_years: parseInt(form.age_years),
        last_maintenance_days: parseInt(form.last_maintenance_days),
        fault_history: parseInt(form.fault_history),
      });
      onAdded();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to add asset.";
      setError(String(msg));
    } finally { setSaving(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#111827", border: "1px solid #374151", borderRadius: 6,
    padding: "7px 10px", color: "#f3f4f6", fontSize: "0.8rem",
  };
  const labelStyle: React.CSSProperties = { fontSize: "0.7rem", color: "#9ca3af", marginBottom: 3, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#0f172a", border: "1px solid #374151", borderRadius: 12, padding: 28, width: 580, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 60px #000a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#f3f4f6" }}>➕ Add New Asset</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
        </div>

        {error && (
          <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 6, padding: "8px 12px", color: "#f87171", fontSize: "0.78rem", marginBottom: 14 }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Row 1 */}
          <div>
            <label style={labelStyle}>Asset ID *</label>
            <input style={inputStyle} value={form.id} onChange={e => set("id", e.target.value)} placeholder="e.g. TX-200" />
          </div>
          <div>
            <label style={labelStyle}>Asset Name *</label>
            <input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Transformer TX-200" />
          </div>
          {/* Row 2 */}
          <div>
            <label style={labelStyle}>Type *</label>
            <select style={inputStyle} value={form.type} onChange={e => set("type", e.target.value)}>
              <option value="transformer">Transformer</option>
              <option value="substation">Substation</option>
              <option value="feeder">Feeder</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Substation *</label>
            <input style={inputStyle} value={form.substation} onChange={e => set("substation", e.target.value)} placeholder="e.g. Sub-Alpha" />
          </div>
          {/* Row 3 */}
          <div>
            <label style={labelStyle}>Region *</label>
            <input style={inputStyle} value={form.region} onChange={e => set("region", e.target.value)} placeholder="e.g. Houston North" />
          </div>
          <div>
            <label style={labelStyle}>Rated Capacity (kVA)</label>
            <input style={inputStyle} type="number" value={form.rated_capacity_kva} onChange={e => set("rated_capacity_kva", e.target.value)} />
          </div>
          {/* Row 4 */}
          <div>
            <label style={labelStyle}>Health Score (0–100)</label>
            <input style={inputStyle} type="number" min="0" max="100" value={form.health_score} onChange={e => set("health_score", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Failure Probability (0–1)</label>
            <input style={inputStyle} type="number" min="0" max="1" step="0.01" value={form.failure_probability} onChange={e => set("failure_probability", e.target.value)} />
          </div>
          {/* Row 5 */}
          <div>
            <label style={labelStyle}>Impact Score (0–100)</label>
            <input style={inputStyle} type="number" min="0" max="100" value={form.impact_score} onChange={e => set("impact_score", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Customers Affected</label>
            <input style={inputStyle} type="number" min="0" value={form.customers_affected} onChange={e => set("customers_affected", e.target.value)} />
          </div>
          {/* Row 6 */}
          <div>
            <label style={labelStyle}>Installation Year</label>
            <input style={inputStyle} type="number" min="1950" max="2030" value={form.installation_year} onChange={e => set("installation_year", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Age (years)</label>
            <input style={inputStyle} type="number" min="0" max="80" value={form.age_years} onChange={e => set("age_years", e.target.value)} />
          </div>
          {/* Row 7 */}
          <div>
            <label style={labelStyle}>Days Since Last Maintenance</label>
            <input style={inputStyle} type="number" min="0" value={form.last_maintenance_days} onChange={e => set("last_maintenance_days", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Fault History (count)</label>
            <input style={inputStyle} type="number" min="0" value={form.fault_history} onChange={e => set("fault_history", e.target.value)} />
          </div>
          {/* Row 8 — full width */}
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Critical Facilities (comma-separated, optional)</label>
            <input style={inputStyle} value={form.critical_facilities} onChange={e => set("critical_facilities", e.target.value)} placeholder="e.g. City Hospital, Water Plant #2" />
          </div>
          {/* Row 9 — coords */}
          <div>
            <label style={labelStyle}>Latitude</label>
            <input style={inputStyle} type="number" step="0.0001" value={form.latitude} onChange={e => set("latitude", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Longitude</label>
            <input style={inputStyle} type="number" step="0.0001" value={form.longitude} onChange={e => set("longitude", e.target.value)} />
          </div>
        </div>

        {/* Preview status */}
        <div style={{ marginTop: 14, background: "#111827", borderRadius: 6, padding: "8px 12px", fontSize: "0.75rem", color: "#9ca3af" }}>
          Derived status: <span style={{ fontWeight: 700, color: parseFloat(form.failure_probability) >= 0.65 ? "#f87171" : parseFloat(form.failure_probability) >= 0.35 ? "#fbbf24" : "#4ade80" }}>
            {parseFloat(form.failure_probability) >= 0.65 || parseFloat(form.health_score) < 45 ? "CRITICAL" : parseFloat(form.failure_probability) >= 0.35 || parseFloat(form.health_score) < 68 ? "WARNING" : "NORMAL"}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 6, padding: "8px 18px", color: "#9ca3af", fontSize: "0.8rem", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ background: saving ? "#374151" : "#1d4ed8", border: "none", borderRadius: 6, padding: "8px 20px", color: "#fff", fontSize: "0.8rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving..." : "Add Asset"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ────────────────────────────────────────
function DeleteConfirmModal({ asset, onClose, onDeleted }: { asset: Asset; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/api/assets/${asset.id}`);
      onDeleted();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to delete asset.";
      setError(String(msg));
    } finally { setDeleting(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#0f172a", border: "1px solid #7f1d1d", borderRadius: 12, padding: 28, width: 420, boxShadow: "0 25px 60px #000a" }}>
        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f87171", marginBottom: 10 }}>🗑 Remove Asset</div>
        <p style={{ fontSize: "0.82rem", color: "#d1d5db", marginBottom: 8 }}>
          Are you sure you want to remove <strong style={{ color: "#f3f4f6" }}>{asset.name}</strong> ({asset.id})?
        </p>
        <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: 16 }}>
          This will also remove all related alerts, predictions, and maintenance actions for this asset. This action cannot be undone in the current session.
        </p>
        {error && <div style={{ color: "#f87171", fontSize: "0.78rem", marginBottom: 10 }}>⚠ {error}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 6, padding: "8px 18px", color: "#9ca3af", fontSize: "0.8rem", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting}
            style={{ background: deleting ? "#374151" : "#991b1b", border: "none", borderRadius: 6, padding: "8px 20px", color: "#fff", fontSize: "0.8rem", fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer" }}>
            {deleting ? "Removing..." : "Yes, Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export function AssetIntelligencePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState<keyof Asset>("priority");
  const [sortAsc, setSortAsc] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await fetchAssets();
      setAssets(data.assets ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const filtered = assets
    .filter(a => {
      if (typeFilter && a.type !== typeFilter) return false;
      if (statusFilter && a.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return a.id.toLowerCase().includes(s) || a.name.toLowerCase().includes(s) || a.region.toLowerCase().includes(s);
      }
      return true;
    })
    .sort((a, b) => {
      const av = a[sortBy] as number | string;
      const bv = b[sortBy] as number | string;
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const toggleSort = (field: keyof Asset) => {
    if (sortBy === field) setSortAsc(!sortAsc);
    else { setSortBy(field); setSortAsc(true); }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", marginTop: 80 }}><Spinner /></div>;

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: "#052e16", border: "1px solid #16a34a", borderRadius: 8, padding: "10px 18px", color: "#4ade80", fontSize: "0.82rem", fontWeight: 600, zIndex: 2000, boxShadow: "0 8px 30px #0008" }}>
          ✓ {toast}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddAssetModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => { load(); showToast("Asset added successfully!"); }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          asset={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { load(); showToast(`Asset ${deleteTarget.id} removed.`); setDeleteTarget(null); }}
        />
      )}

      <PageHeader
        title="Asset Intelligence"
        subtitle={`${filtered.length} of ${assets.length} assets`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <SyntheticBadge />
            <button
              onClick={() => setShowAddModal(true)}
              style={{ background: "#166534", border: "1px solid #16a34a", borderRadius: 6, padding: "7px 14px", color: "#4ade80", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
              ➕ Add Asset
            </button>
          </div>
        }
      />

      <Panel>
        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)} placeholder="Search asset ID, name, region..."
            style={{ flex: "1 1 200px", background: "#111827", border: "1px solid #374151", borderRadius: 6, padding: "7px 12px", color: "#f3f4f6", fontSize: "0.8rem" }}
          />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ background: "#111827", border: "1px solid #374151", borderRadius: 6, padding: "7px 10px", color: "#f3f4f6", fontSize: "0.78rem" }}>
            <option value="">All Types</option>
            <option value="transformer">Transformer</option>
            <option value="substation">Substation</option>
            <option value="feeder">Feeder</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: "#111827", border: "1px solid #374151", borderRadius: 6, padding: "7px 10px", color: "#f3f4f6", fontSize: "0.78rem" }}>
            <option value="">All Status</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="normal">Normal</option>
          </select>
          <Btn variant="secondary" small onClick={() => { setSearch(""); setTypeFilter(""); setStatusFilter(""); }}>Clear</Btn>
        </div>

        {/* Quick filter pills */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {[
            { label: "🚨 Critical", s: "critical", t: "" },
            { label: "⚠ Warning", s: "warning", t: "" },
            { label: "🔧 Transformers", s: "", t: "transformer" },
            { label: "🏗 Substations", s: "", t: "substation" },
            { label: "⚡ Feeders", s: "", t: "feeder" },
          ].map(f => (
            <button key={f.label} onClick={() => { setStatusFilter(f.s); setTypeFilter(f.t); }}
              style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 20, padding: "3px 10px", color: "#9ca3af", fontSize: "0.7rem", cursor: "pointer" }}>
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? <EmptyState message="No assets match the current filters." /> : (
          <Table headers={["#", "Asset", "Type", "Region", "Health", "Failure Risk", "Impact", "Customers", "Status", "Actions"]}>
            {filtered.map(a => (
              <TR key={a.id}>
                <TD><span style={{ fontWeight: 700, color: "#6b7280", fontSize: "0.72rem" }}>#{a.priority}</span></TD>
                <TD>
                  <div style={{ fontWeight: 700, color: "#f3f4f6", fontSize: "0.82rem" }}>{a.name}</div>
                  <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>{a.id} · {a.substation}</div>
                </TD>
                <TD muted><span style={{ textTransform: "capitalize" }}>{a.type}</span></TD>
                <TD muted>{a.region}</TD>
                <TD><HealthBar score={a.health_score} size="sm" /></TD>
                <TD>
                  <span style={{ color: riskColor(a.failure_probability), fontWeight: 700, fontSize: "0.82rem" }}>
                    {(a.failure_probability * 100).toFixed(0)}%
                  </span>
                </TD>
                <TD>
                  <span style={{ color: a.impact_score >= 80 ? "#f87171" : a.impact_score >= 60 ? "#fbbf24" : "#9ca3af" }}>
                    {a.impact_score}/100
                  </span>
                </TD>
                <TD muted>{a.customers_affected.toLocaleString()}</TD>
                <TD><StatusBadge status={a.status} small /></TD>
                <TD>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Link to={`/assets/${a.id}`}
                      style={{ background: "#1e3a5f", color: "#60a5fa", border: "none", borderRadius: 4, padding: "3px 8px", fontSize: "0.68rem", fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>
                      Detail
                    </Link>
                    <Link to={`/advisor?asset=${a.id}`}
                      style={{ background: "#1e1b4b", color: "#a5b4fc", border: "none", borderRadius: 4, padding: "3px 8px", fontSize: "0.68rem", fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>
                      Advisor
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(a)}
                      style={{ background: "#450a0a", color: "#f87171", border: "1px solid #7f1d1d", borderRadius: 4, padding: "3px 8px", fontSize: "0.68rem", fontWeight: 600, cursor: "pointer" }}
                      title="Remove asset">
                      🗑
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
          </Table>
        )}

        {/* Footer summary */}
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #1f2937", display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#4b5563" }}>
          <span>{assets.length} total assets · {assets.filter(a=>a.status==="critical").length} critical · {assets.filter(a=>a.status==="warning").length} warning</span>
          <span>Click ➕ Add Asset to add a new asset · 🗑 to remove</span>
        </div>
      </Panel>
    </div>
  );
}
