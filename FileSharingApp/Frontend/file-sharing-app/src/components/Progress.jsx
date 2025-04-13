// components/Progress.jsx
import { motion } from "framer-motion"

export function Progress({ value, className }) {
  return (
    <div className={`relative w-full h-2 rounded-full overflow-hidden bg-gray-200 ${className || ""}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-pink-500 to-purple-600"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ ease: "easeOut", duration: 0.5 }}
      />
    </div>
  )
}
