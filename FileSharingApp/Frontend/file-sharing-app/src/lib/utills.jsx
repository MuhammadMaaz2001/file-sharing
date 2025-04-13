

function Button({ isActive }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded",
        isActive ? "bg-blue-500 text-white" : "bg-gray-300"
      )}
    >
      Click Me
    </button>
  );
}
