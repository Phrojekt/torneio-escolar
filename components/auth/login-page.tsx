"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trophy } from "lucide-react"
import { toast } from "sonner"

interface LoginPageProps {
  onLogin: (userType: "administrador" | "jogador") => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [userType, setUserType] = useState<"administrador" | "jogador" | null>(null)
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    console.log("Login attempt:", { userType, password })
    
    if (userType === "administrador" && password === "admin123") {
      console.log("Administrador login successful")
      toast.success("Login realizado com sucesso!")
      onLogin("administrador")
    } else if (userType === "jogador") {
      console.log("Jogador login successful")
      toast.success("Login realizado com sucesso!")
      onLogin("jogador")
    } else {
      console.log("Login failed")
      toast.error("Credenciais inválidas.")
    }
  }

  const handleUserTypeSelect = (type: "administrador" | "jogador") => {
    console.log("User type selected:", type)
    setUserType(type)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-blue-200 to-cyan-300 flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black mb-2">Torneio Jamboree</CardTitle>
            <CardDescription className="text-blue-100 font-semibold text-sm sm:text-base">
              Sistema de Acompanhamento
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-base sm:text-lg font-bold text-gray-700">Tipo de Usuário</Label>
            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => handleUserTypeSelect("administrador")}
                className={`h-16 sm:h-14 rounded-xl font-bold text-base transition-all duration-200 ${userType === "administrador"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg border-2 border-purple-500"
                  : "border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
              >
                Administrador
              </button>
              <button
                type="button"
                onClick={() => handleUserTypeSelect("jogador")}
                className={`h-16 sm:h-14 rounded-xl font-bold text-base transition-all duration-200 ${userType === "jogador"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg border-2 border-blue-500"
                  : "border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
              >
                Jogador
              </button>
            </div>
          </div>

          {userType === "administrador" && (
            <div className="space-y-3">
              <Label className="text-base sm:text-lg font-bold text-gray-700">Senha</Label>
              <Input
                type="password"
                placeholder="Digite a senha do administrador"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 sm:h-14 rounded-xl border-2 border-gray-300 text-base sm:text-base touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              />
            </div>
          )}

          {userType === "jogador" && (
            <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
              <p className="text-sm text-green-700 font-semibold text-center">
                Acesso liberado para jogadores - clique em "ENTRAR"
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={!userType || (userType === "administrador" && !password)}
            className="w-full h-16 sm:h-14 rounded-xl font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ENTRAR
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
