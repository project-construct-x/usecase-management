import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api.ts";
import type {Role, SubUseCase, Transaction, TransactionMutate} from "../types.ts";
import {ArrowLeftRight, Tags} from "lucide-react";

const emptyTransaction: TransactionMutate = {
  process_number: "",
  name: "",
  subUseCase_id: null,
  usesDataspace: true,
  roleIn_id: 0,
  roleOut_id: 0,
  related_class_id: "",
  data_carrier: "",
  dataformat_available: "",
  dataformat: "",
  timing: "",
  policies: "",
  data_size: "",
}

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<TransactionMutate>(emptyTransaction);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [roles, setRoles] = useState<Role[]>([])
  const [subUseCases, setSubUseCases] = useState<SubUseCase[]>([])

  useEffect(() => {
    loadRoles();
    loadSubUseCases();
    if (id !== "new") {
      loadTransaction();
    }
  }, [id]);

  const toMutate = (data: Transaction): TransactionMutate => ({
    process_number: data.process_number,
    name: data.name,
    subUseCase_id: data.subUseCase_id,
    usesDataspace: data.usesDataspace,
    roleOut_id: data.roleOut.id,
    roleIn_id: data.roleIn.id,
    related_class_id: data.related_class_id,
    data_carrier: data.data_carrier,
    dataformat_available: data.dataformat_available,
    dataformat: data.dataformat,
    timing: data.timing,
    policies: data.policies,
    data_size: data.data_size,
  });

  async function loadTransaction() {
    setLoading(true);
    try {
      const data = await api.getTransaction(Number(id));
      setItem(toMutate(data));
    } catch (error) {
      console.error("Fehler beim Laden: ", error);
      alert("Transaktion konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRoles() {
    setLoading(true);
    try {
      const roles = await api.listRoles();
      setRoles(roles);
    } catch (error) {
      console.error("Fehler beim Laden: ", error);
      alert("Rollen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSubUseCases() {
    setLoading(true);
    try {
      const subUseCases = await api.listSubUseCases();
      setSubUseCases(subUseCases);
    } catch (error) {
      console.error("Fehler beim Laden: ", error);
      alert("Sub Use Cases konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (id === "new") {
        console.log(JSON.stringify(item))
        const created = await api.createTransaction(item);
        navigate(`/transactions/${created.id}`);
      } else {
        await api.updateTransaction(Number(id)!, item);
        await loadTransaction();
        alert("Transaktion erfolgreich aktualisiert");
      }
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern der Transaktion");
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof TransactionMutate>(
    field: K,
    value: TransactionMutate[K]
  ) {
    setItem(prev => ({ ...prev, [field]: value }));
  }

  if (loading && id !== "new") {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "64px 24px" }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    )
  }

  const tabs = [
    { id: "basic", label: "Grunddaten", badge: undefined, icon: Tags},
  ]

  console.log(item.subUseCase_id)

  return (
    <div className="page-container-narrow animate-fade-in">
      <div className="page-header">
        <div className="page-header-icon">
          <ArrowLeftRight size={22} />
        </div>
        <div>
          <div className="page-header-title">
            {id === "new" ? "Neue Transaktion" : item.name}
          </div>
          <div className="page-header-sub">Transaktion</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {/* Tabs */}
        <div className="tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`tab ${activeTab === tab.id ? "tab-active" : "tab-inactive"}`}
              >
                {Icon && <Icon size={15} />}
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="badge badge-primary">{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="card">
          <div className="card-body form-section custom-scrollbar">

            {/* Grunddaten */}
            {activeTab === "basic" && (
              <>
                <div className="form-grid-2">
                  <div>
                    <label className="form-label form-label-required">Nummer im Prozess</label>
                    <input
                      type="text"
                      required
                      value={item.process_number || ""}
                      onChange={(e) => updateField("process_number", e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label form-label-required">Name</label>
                    <input
                      type="text"
                      required
                      value={item.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label form-label-required">Sub Use Case</label>
                  <select
                    required
                    value={item.subUseCase_id || ""}
                    onChange={(e) => updateField("subUseCase_id", Number(e.target.value))}
                    className="form-input form-select"
                  >
                    <option value="">Bitte wählen</option>
                    {subUseCases.map((suc) => (
                      <option key={suc.id} value={suc.id}>
                        {suc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-check-row">
                  <input
                    type="checkbox"
                    id="usesDataspace"
                    checked={item.usesDataspace || false}
                    onChange={e => updateField("usesDataspace", e.target.checked)}
                    className="form-checkbox"
                  />
                  <label htmlFor="usesDataspace" className="form-check-label">
                    Transaktion nutzt den Datenraum
                  </label>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label form-label-required">Ausgehende Rolle</label>
                    <select
                      required
                      value={item.roleOut_id ?? ""}
                      onChange={e => updateField("roleOut_id", Number(e.target.value))}
                      className="form-input form-select"
                    >
                      <option value="" disabled>Bitte wählen</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label form-label-required">Eingehende Rolle</label>
                    <select
                      required
                      value={item.roleIn_id ?? ""}
                      onChange={e => updateField("roleIn_id", Number(e.target.value))}
                      className="form-input form-select"
                    >
                      <option value="" disabled>Bitte wählen</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label form-label">Klasse</label>
                  <input
                    type="text"
                    required
                    value={item.related_class_id || ""}
                    onChange={(e) => updateField("related_class_id", e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label form-label">Datenträger</label>
                  <input
                    type="text"
                    required
                    value={item.data_carrier || ""}
                    onChange={(e) => updateField("data_carrier", e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label form-label">Ist ein Datenformat vorhanden?</label>
                    <input
                      type="text"
                      required
                      value={item.dataformat_available || ""}
                      onChange={(e) => updateField("dataformat_available", e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label form-label">Datenformat</label>
                    <input
                      type="text"
                      required
                      value={item.dataformat || ""}
                      onChange={(e) => updateField("dataformat", e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label form-label">Häufigkeit/Zyklus</label>
                    <input
                      type="text"
                      required
                      value={item.timing || ""}
                      onChange={(e) => updateField("timing", e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label form-label">Geschätzte Datengröße</label>
                    <input
                      type="text"
                      required
                      value={item.data_size || ""}
                      onChange={(e) => updateField("data_size", e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                    <label className="form-label form-label">Zugriffsbeschränkungen</label>
                    <input
                      type="text"
                      required
                      value={item.policies || ""}
                      onChange={(e) => updateField("policies", e.target.value)}
                      className="form-input"
                    />
                  </div>

              </>
            )}
          </div>
        </div>

        {/* Aktionen */}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Speichern…" : "Speichern"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
            Zurück
          </button>
        </div>
      </form>
    </div>
  );
}
