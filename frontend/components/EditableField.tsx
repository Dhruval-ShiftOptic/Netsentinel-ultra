"use client";
import { useState } from 'react';

export default function EditableField({ label, value, onSave }: { label: string; value: string; onSave: (v:string)=>Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  return (
    <div className="editable">
      <div className="miniLabel">{label}</div>
      {editing ? (
        <div className="inlineEdit"><input className="field small" value={draft} onChange={(e)=>setDraft(e.target.value)} /><button className="ghostBtn" onClick={async()=>{await onSave(draft); setEditing(false);}}>Save</button></div>
      ) : (
        <button className="linkish" onClick={()=>setEditing(true)}>{value || 'Set value'}</button>
      )}
    </div>
  );
}
