import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import Field from '../Fields'

/* One generic manager for every collection: list → modal (create/edit) →
   publish toggle → move up/down → delete. GSTS pattern, factory-fied. */
export default function CollectionManager({ schema }) {
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(undefined) // undefined=closed, null=create, object=edit
  const [form, setForm] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api.listItems(schema.key).then(setItems).catch((e) => setError(e.message))
  }, [schema.key])
  useEffect(load, [load])

  const open = (item) => {
    setEditing(item ?? null)
    setForm(item ? { ...item } : {})
  }
  const close = () => { setEditing(undefined); setForm({}) }
  const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const save = async () => {
    for (const f of schema.fields) {
      if (f.required && !form[f.name] && form[f.name] !== 0) {
        setError(`"${f.label}" is required`); return
      }
    }
    setBusy(true); setError('')
    try {
      const { id, sort, published, updatedAt, ...data } = form
      for (const f of schema.fields) {
        if (f.type === 'number' && data[f.name] !== undefined && data[f.name] !== '') data[f.name] = +data[f.name]
      }
      if (editing) await api.updateItem(schema.key, editing.id, { ...data, published: editing.published })
      else await api.createItem(schema.key, data)
      close(); load()
    } catch (e) {
      setError(e.message)
    } finally { setBusy(false) }
  }

  const remove = async (item) => {
    if (!confirm(`Delete "${item[schema.titleField] || item.id}"? This cannot be undone.`)) return
    try {
      await api.deleteItem(schema.key, item.id)
      setError('')
    } catch (e) { setError(`Delete failed: ${e.message}`) }
    load()
  }

  const togglePublish = async (item) => {
    const { id, sort, published, updatedAt, ...data } = item
    try {
      await api.updateItem(schema.key, id, { ...data, published: !published })
      setError('')
    } catch (e) { setError(`Update failed: ${e.message}`) }
    load()
  }

  const move = async (index, dir) => {
    const order = items.map((i) => i.id)
    const j = index + dir
    if (j < 0 || j >= order.length) return
    ;[order[index], order[j]] = [order[j], order[index]]
    try {
      await api.reorder(schema.key, order)
      setError('')
    } catch (e) { setError(`Reorder failed: ${e.message}`) }
    load()
  }

  if (!items) return <p className="adm-dim">Loading…</p>

  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1><i>{schema.icon}</i>{schema.label} <span className="adm-count">{items.length}</span></h1>
        <div className="adm-head-actions">
          {error && editing === undefined && <span className="adm-err">{error}</span>}
          <button className="adm-btn" onClick={() => open(null)}>+ Add</button>
        </div>
      </header>

      <div className="adm-list">
        {items.length === 0 && <p className="adm-dim">Nothing here yet — add the first one.</p>}
        {items.length > 0 && items.every((i) => !i.published) && (
          <p className="adm-dim">All items are hidden — the live site falls back to the built-in defaults for this section.</p>
        )}
        {items.map((item, i) => (
          <div className={`adm-item${item.published ? '' : ' off'}`} key={item.id}>
            <div className="adm-item-move">
              <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
            </div>
            <button className="adm-item-title" onClick={() => open(item)}>
              {item[schema.titleField] || `#${item.id}`}
              {!item.published && <em> · hidden</em>}
            </button>
            <div className="adm-item-actions">
              <button onClick={() => togglePublish(item)}>{item.published ? 'Hide' : 'Publish'}</button>
              <button onClick={() => open(item)}>Edit</button>
              <button className="danger" onClick={() => remove(item)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing !== undefined && (
        <div className="adm-modal" onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="adm-modal-in">
            <h2>{editing ? 'Edit' : 'New'} — {schema.label}</h2>
            <div className="adm-form">
              {schema.fields.map((f) => (
                <Field key={f.name} field={f} value={form[f.name]} onChange={onChange} />
              ))}
            </div>
            {error && <p className="adm-err">{error}</p>}
            <div className="adm-modal-actions">
              <button className="adm-btn ghost" onClick={close}>Cancel</button>
              <button className="adm-btn" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
