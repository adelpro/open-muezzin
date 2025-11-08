import Logo from "url:~/assets/icon512.png"

export function Header() {
  return (
    <div className="flex gap-3 justify-center items-center mb-6 w-full">
      <img src={Logo} alt="Muezzin Logo" className="w-10 h-10" />
      <div className="flex flex-col items-start">
        <h1 className="text-2xl font-bold leading-tight text-primary-600">
          Muezzin
        </h1>
        <span className="text-xs text-gray-500">Prayer Times</span>
      </div>
    </div>
  )
}
