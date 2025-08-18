"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import UserDropdownMenu from "./UserDropdownMenu"

export default function AppNavbar() {
	const { status } = useSession()

	// Solo mostrar el navbar si el usuario está autenticado
	if (status !== "authenticated") {
		return null
	}

	return (
		<nav className="bg-white shadow-sm sticky top-0 z-40">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						<Link href="/dashboard" className="text-xl font-semibold text-gray-900">
							Sistema de Login Seguro
						</Link>
					</div>
					<div className="flex items-center space-x-4">
						<Link href="/users" className="hidden sm:inline-flex bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
							Gestión de Usuarios
						</Link>
						<Link href="/products" className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
							Gestión de Productos
						</Link>
						<UserDropdownMenu />
					</div>
				</div>
			</div>
		</nav>
	)
}