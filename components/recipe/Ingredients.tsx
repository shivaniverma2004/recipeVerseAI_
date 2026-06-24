'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, AlertCircle } from 'lucide-react'

export interface Ingredient {
    id: string;
    name: string;
    quantity: string;
    unit: string;
}

const Ingredients = ({ ingredients, setIngredients }: { ingredients: Ingredient[], setIngredients: (ingredients: Ingredient[]) => void }) => {
    const [name, setName] = useState('')
    const [quantity, setQuantity] = useState('')
    const [unit, setUnit] = useState('')

    const handleAdd = () => {
        if (!name.trim()) return

        const newIngredient: Ingredient = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
            name: name.trim(),
            quantity: quantity.trim(),
            unit: unit.trim(),
        }

        setIngredients([...ingredients, newIngredient])
        setName('')
        setQuantity('')
        setUnit('')
    }

    const handleRemove = (id: string) => {
        setIngredients(ingredients.filter(ing => ing.id !== id))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAdd()
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-semibold text-foreground">Ingredients</h3>
                    <p className="text-xs text-muted-foreground">Add the ingredients needed for this recipe.</p>
                </div>
                {ingredients.length > 0 && (
                    <div className="">
                        <span className="hidden sm:block text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            {ingredients.length} {ingredients.length === 1 ? 'ingredient' : 'ingredients'}
                        </span>
                        <span className="sm:hidden text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            {ingredients.length}
                        </span>
                    </div>
                )}
            </div>

            <div className="border border-border/60 rounded-xl overflow-x-auto bg-card shadow-sm">
                <table className="border-collapse text-sm w-[500px] sm:w-full">
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                            <th className="py-3 px-4 text-left w-[35%] font-semibold">Ingredient Name</th>
                            <th className="py-3 px-4 text-left w-[15%] font-semibold">Quantity</th>
                            <th className="py-3 px-4 text-left w-[15%] font-semibold">Unit</th>
                            <th className="py-3 px-4 text-center w-[10%] font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {ingredients.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 px-4 text-center text-muted-foreground bg-muted/5">
                                    <div className="flex flex-col items-center justify-center gap-1.5">
                                        <AlertCircle className="h-5 w-5 text-muted-foreground/60" />
                                        <p className="font-medium text-xs">No ingredients added yet</p>
                                        <p className="text-[11px] text-muted-foreground/80">Use the input row below to add ingredients to your recipe.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            ingredients.map((ing) => (
                                <tr key={ing.id} className="hover:bg-muted/10 transition-colors group">
                                    <td className="py-2.5 px-4 font-medium text-foreground">{ing.name}</td>
                                    <td className="py-2.5 px-4 text-muted-foreground">{ing.quantity || '—'}</td>
                                    <td className="py-2.5 px-4 text-muted-foreground">{ing.unit || '—'}</td>
                                    <td className="py-2.5 px-4 text-center">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon-xs"
                                            onClick={() => handleRemove(ing.id)}
                                            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 transition-opacity"
                                            title="Delete Ingredient"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}

                        {/* Input Row */}
                        <tr className="bg-muted/10">
                            <td className="py-3 px-3">
                                <Input
                                    type="text"
                                    placeholder="e.g. Fresh basil leaves"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="h-8.5 bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary"
                                />
                            </td>
                            <td className="py-3 px-3">
                                <Input
                                    type="text"
                                    placeholder="e.g. 2"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="h-8.5 bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary"
                                />
                            </td>
                            <td className="py-3 px-3">
                                <Input
                                    type="text"
                                    placeholder="e.g. cups, grams"
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="h-8.5 bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary"
                                />
                            </td>
                            <td className="py-3 px-3 text-center">
                                <Button
                                    type="button"
                                    onClick={handleAdd}
                                    disabled={!name.trim()}
                                    size="sm"
                                    className="w-full flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-8.5"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Add</span>
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Hidden field for parent form submission */}
            <input type="hidden" name="ingredients" value={JSON.stringify(ingredients)} />
        </div>
    )
}

export default Ingredients