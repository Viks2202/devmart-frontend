import { Link } from "react-router-dom"
import Button from "./Button"

export default function EmptyState({ icon, title, description, actionLabel, actionLink }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{description}</p>
      {actionLabel && actionLink && (
        <Link to={actionLink}>
          <Button variant="primary">{actionLabel}</Button>
        </Link>
      )}
    </div>
  )
}