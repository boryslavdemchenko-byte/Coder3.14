export default function Modal({children, open, onClose}){
  if(!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded shadow" onClick={(e)=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
