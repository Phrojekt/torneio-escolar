"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingBag, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface LojaManagerProps {
  torneio: any
}

export function LojaManager({ torneio }: LojaManagerProps) {
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [preco, setPreco] = useState("")
  const [quantidade, setQuantidade] = useState("")
  const [rodadaSelecionada, setRodadaSelecionada] = useState("")
  const [itemEditando, setItemEditando] = useState<any>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null)
  const [imagemPreview, setImagemPreview] = useState<string>("")
  const [uploadandoImagem, setUploadandoImagem] = useState(false)

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0]
    if (arquivo) {
      setImagemArquivo(arquivo)
      
      // Criar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagemPreview(reader.result as string)
      }
      reader.readAsDataURL(arquivo)
    }
  }

  const uploadImagem = async (): Promise<string | undefined> => {
    if (!imagemArquivo) return undefined

    try {
      setUploadandoImagem(true)
      
      const formData = new FormData()
      formData.append('file', imagemArquivo)
      formData.append('tag', 'ITEM')
      formData.append('type', 'item')

      console.log('📤 Fazendo upload de item:', imagemArquivo.name);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      console.log('📥 Resultado do upload do item:', result);

      if (result.success) {
        console.log('✅ Upload de item bem-sucedido:', result.imageUrl);
        return result.imageUrl
      } else {
        console.error('❌ Erro no upload do item:', result.message);
        toast.error(result.message || 'Erro no upload da imagem')
        return undefined
      }
    } catch (error) {
      console.error('❌ Erro no upload do item:', error)
      toast.error('Erro no upload da imagem')
      return undefined
    } finally {
      setUploadandoImagem(false)
    }
  }

  const limparImagem = () => {
    setImagemArquivo(null)
    setImagemPreview("")
  }

  const handleAdicionarItem = async () => {
    try {
      if (!nome || !descricao || !preco || !quantidade || !rodadaSelecionada) {
        toast.error("Preencha todos os campos!")
        return
      }

      // Upload da imagem se houver
      let imagemUrl: string | undefined = undefined
      if (imagemArquivo) {
        imagemUrl = await uploadImagem()
        if (!imagemUrl) return // Se falhou no upload, para a execução
      }

      await torneio.adicionarItemLoja(nome, descricao, parseInt(preco), rodadaSelecionada, parseInt(quantidade), imagemUrl)
      toast.success("Item adicionado com sucesso!")
      setNome("")
      setDescricao("")
      setPreco("")
      setQuantidade("")
      limparImagem()
    } catch (error) {
      toast.error("Erro ao adicionar item")
    }
  }

  const handleEditarItem = (item: any) => {
    setItemEditando(item)
    setNome(item.nome)
    setDescricao(item.descricao)
    setPreco(item.preco.toString())
    setQuantidade(item.quantidadeTotal?.toString() || "0")
    setRodadaSelecionada(item.rodada)
    
    // Carregar imagem atual se existir
    if (item.imagem) {
      setImagemPreview(item.imagem)
    } else {
      setImagemPreview("")
    }
    
    setModoEdicao(true)
  }

  const handleSalvarEdicao = async () => {
    try {
      if (!nome || !descricao || !preco || !quantidade || !rodadaSelecionada) {
        toast.error("Preencha todos os campos!")
        return
      }

      // Upload nova imagem se selecionada
      let imagemUrl: string | undefined = itemEditando.imagem // Manter a atual por padrão
      if (imagemArquivo) {
        const novaImagemUrl = await uploadImagem()
        if (novaImagemUrl) {
          imagemUrl = novaImagemUrl
        } else {
          return // Se falhou no upload, para a execução
        }
      }

      await torneio.editarItemLoja(itemEditando.id, nome, descricao, parseInt(preco), rodadaSelecionada, parseInt(quantidade), imagemUrl)
      toast.success("Item editado com sucesso!")
      handleCancelarEdicao()
    } catch (error) {
      toast.error("Erro ao editar item")
    }
  }

  const handleCancelarEdicao = () => {
    setModoEdicao(false)
    setItemEditando(null)
    setNome("")
    setDescricao("")
    setPreco("")
    setQuantidade("")
    setRodadaSelecionada("")
    limparImagem()
  }

  const handleRemoverItem = async (itemId: string) => {
    try {
      await torneio.removerItemLoja(itemId)
      toast.success("Item removido com sucesso!")
    } catch (error) {
      toast.error("Erro ao remover item")
    }
  }

  return (
    <div className="space-y-6">
      {/* Adicionar/Editar Item */}
      <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-6 py-6">
          <CardTitle className="text-2xl font-black">
            {modoEdicao ? 'Editar Item da Loja' : 'Adicionar Item à Loja Misteriosa'}
          </CardTitle>
          {modoEdicao && (
            <CardDescription className="text-slate-200 font-semibold">
              Editando: {itemEditando?.nome}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label className="font-bold text-gray-700">Nome do Item</Label>
              <Input
                placeholder="Nome do item"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="rounded-full border-2 border-gray-300 h-12"
              />
            </div>
            <div>
              <Label className="font-bold text-gray-700">Descrição</Label>
              <Input
                placeholder="Descrição do item"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="rounded-full border-2 border-gray-300 h-12"
              />
            </div>
            <div>
              <Label className="font-bold text-gray-700">Imagem do Item (opcional)</Label>
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImagemChange}
                  className="rounded-full border-2 border-gray-300 h-12 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imagemPreview && (
                  <div className="relative">
                    <img 
                      src={imagemPreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200" 
                    />
                    <button
                      type="button"
                      onClick={limparImagem}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label className="font-bold text-gray-700">Preço (moedas)</Label>
              <Input
                type="number"
                placeholder="0"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="rounded-full border-2 border-gray-300 h-12"
              />
            </div>
            <div>
              <Label className="font-bold text-gray-700">Quantidade Disponível</Label>
              <Input
                type="number"
                placeholder="0"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="rounded-full border-2 border-gray-300 h-12"
                min="0"
              />
            </div>
            <div>
              <Label className="font-bold text-gray-700">Rodada</Label>
              <Select value={rodadaSelecionada} onValueChange={setRodadaSelecionada}>
                <SelectTrigger className="h-12 rounded-full border-2 border-gray-300">
                  <SelectValue placeholder="Selecione a rodada" />
                </SelectTrigger>
                <SelectContent>
                  {torneio.rodadas.map((rodada: any) => (
                    <SelectItem key={rodada.id} value={rodada.id}>
                      {rodada.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              {modoEdicao ? (
                <>
                  <Button 
                    onClick={handleSalvarEdicao} 
                    disabled={uploadandoImagem}
                    className="flex-1 h-12 rounded-full font-bold bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white disabled:opacity-50"
                  >
                    {uploadandoImagem ? "ENVIANDO IMAGEM..." : "SALVAR ALTERAÇÕES"}
                  </Button>
                  <Button onClick={handleCancelarEdicao} variant="outline" className="flex-1 h-12 rounded-full font-bold border-2 border-gray-300 text-gray-600 hover:bg-gray-50">
                    CANCELAR
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleAdicionarItem} 
                  disabled={uploadandoImagem}
                  className="w-full h-12 rounded-full font-bold bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white disabled:opacity-50"
                >
                  {uploadandoImagem ? "ENVIANDO IMAGEM..." : "ADICIONAR ITEM"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Itens Disponíveis */}
      <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-6 py-6">
          <CardTitle className="text-2xl font-black">Itens Disponíveis</CardTitle>
          <CardDescription className="text-orange-100 font-semibold">
            {torneio.itensLoja.length} {torneio.itensLoja.length === 1 ? 'item' : 'itens'} na loja
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {torneio.itensLoja.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500 font-semibold">Nenhum item cadastrado</p>
                <p className="text-sm text-gray-400">Adicione o primeiro item à loja!</p>
              </div>
            ) : (
              torneio.itensLoja.map((item: any) => (
                <div key={item.id} className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start gap-4">
                    {item.imagem && (
                      <div className="flex-shrink-0">
                        <img 
                          src={item.imagem} 
                          alt={item.nome}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-orange-200" 
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-black text-lg text-gray-800 mb-1">{item.nome}</h3>
                      <p className="text-sm text-gray-600 font-semibold mb-2">{item.descricao}</p>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-black text-orange-600">{item.preco} moedas</p>
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-semibold">
                          {torneio.rodadas.find((r: any) => r.id === item.rodada)?.nome || 'Rodada não encontrada'}
                        </span>
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-semibold">
                          {item.quantidadeDisponivel || 0}/{item.quantidadeTotal || 0} disponível
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleEditarItem(item)}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                        disabled={modoEdicao}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleRemoverItem(item.id)}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-2 border-red-300 text-red-600 hover:bg-red-50"
                        disabled={modoEdicao}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
