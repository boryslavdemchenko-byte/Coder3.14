export default function Toast({message, onClose}){
  if(!message) return null
  return (
    <div className="fixed bottom-6 right-6 bg-white border p-3 rounded shadow flex items-center gap-3">
      <div className="small-muted">{message}</div>
      <button onClick={onClose} className="text-sm text-blue-700">Close</button>
    </div>
  )
}
