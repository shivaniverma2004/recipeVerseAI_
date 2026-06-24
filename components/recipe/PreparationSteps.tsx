'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus, AlertCircle } from 'lucide-react'


export interface PreparationStep {
    id: string;
    stepNumber: number;
    title: string;
    description: string;
}


const PreparationSteps = ({ steps, setSteps }: { steps: PreparationStep[], setSteps: (steps: PreparationStep[]) => void }) => {
    const [stepNumber, setStepNumber] = useState<string>('1')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    const handleAdd = () => {
        if (!title.trim() || !description.trim()) return

        const num = parseInt(stepNumber) || (steps.length + 1)

        const newStep: PreparationStep = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
            stepNumber: num,
            title: title.trim(),
            description: description.trim(),
        }

        const updatedSteps = [
            ...steps.map(step => ({
                ...step,
                stepNumber: step.stepNumber >= num ? step.stepNumber + 1 : step.stepNumber,
            })),
            newStep,
        ].sort((a, b) => a.stepNumber - b.stepNumber)
        setSteps(updatedSteps)

        // Auto-increment the next step number
        setStepNumber((num + 1).toString())
        setTitle('')
        setDescription('')
    }

    const handleRemove = (id: string) => {
        const removedStep = steps.find(step => step.id === id)
        const filtered = steps
            .filter(step => step.id !== id)
            .map(step => ({
                ...step,
                stepNumber: removedStep && step.stepNumber > removedStep.stepNumber ? step.stepNumber - 1 : step.stepNumber,
            }))
            .sort((a, b) => a.stepNumber - b.stepNumber)

        setSteps(filtered)
        // Reset the input step number to match the next logical step
        const maxStep = filtered.reduce((max, s) => s.stepNumber > max ? s.stepNumber : max, 0)
        setStepNumber((maxStep + 1).toString())
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && e.target instanceof HTMLInputElement) {
            e.preventDefault()
            handleAdd()
        }
    }

    useEffect(() => {
        setStepNumber((steps.length + 1).toString())
    }, [steps])

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-semibold text-foreground">Preparation Steps</h3>
                    <p className="text-xs text-muted-foreground">Add step-by-step instructions for preparing the recipe.</p>
                </div>
                {steps.length > 0 && (
                    <div className="">
                        <span className="hidden sm:block text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            {steps.length} {steps.length === 1 ? 'step' : 'steps'}
                        </span>
                        <span className="sm:hidden text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            {steps.length}
                        </span>
                    </div>
                )}
            </div>

            <div className="border border-border/60 rounded-xl overflow-x-auto bg-card shadow-sm">
                <table className="border-collapse text-sm w-[500px] sm:w-full">
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                            <th className="py-3 px-4 text-left w-[12%] font-semibold">Step No.</th>
                            <th className="py-3 px-4 text-left w-[30%] font-semibold">Title</th>
                            <th className="py-3 px-4 text-left w-[48%] font-semibold">Description</th>
                            <th className="py-3 px-4 text-center w-[10%] font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {steps.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-8 px-4 text-center text-muted-foreground bg-muted/5">
                                    <div className="flex flex-col items-center justify-center gap-1.5">
                                        <AlertCircle className="h-5 w-5 text-muted-foreground/60" />
                                        <p className="font-medium text-xs">No preparation steps added yet</p>
                                        <p className="text-[11px] text-muted-foreground/80">Use the input row below to list the cooking instructions.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            steps.map((step) => (
                                <tr key={step.id} className="hover:bg-muted/10 transition-colors group">
                                    <td className="py-2.5 px-4 font-semibold text-primary">
                                        # {/* {step.stepNumber} */}
                                    </td>
                                    <td className="py-2.5 px-4 font-medium text-foreground">{step.title}</td>
                                    <td className="py-2.5 px-4 text-muted-foreground whitespace-pre-wrap leading-relaxed">{step.description}</td>
                                    <td className="py-2.5 px-4 text-center">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon-xs"
                                            onClick={() => handleRemove(step.id)}
                                            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 transition-opacity"
                                            title="Delete Step"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}

                        {/* Input Row */}
                        <tr className="bg-muted/10 align-top">
                            <td className="py-3 px-3 w-[12%]">
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="No."
                                    value={stepNumber}
                                    onChange={(e) => setStepNumber(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="h-8.5 min-w-12 bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary text-center"
                                />
                            </td>
                            <td className="py-3 px-3 w-[30%]">
                                <Input
                                    type="text"
                                    placeholder="e.g., Preheat the oven"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="h-8.5 bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary"
                                />
                            </td>
                            <td className="py-3 px-3 w-[48%]">
                                <Textarea
                                    placeholder="Describe the steps, temperature, and duration..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[60px] max-h-[120px] bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary text-sm py-1.5 px-2.5 leading-normal resize-y"
                                />
                            </td>
                            <td className="py-3 px-3 w-[10%] text-center">
                                <Button
                                    type="button"
                                    onClick={handleAdd}
                                    disabled={!title.trim() || !description.trim()}
                                    size="sm"
                                    className="w-full flex items-center justify-center gap-1 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold h-8.5"
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
            <input type="hidden" name="preparation_steps" value={JSON.stringify(steps)} />
        </div>
    )
}

export default PreparationSteps
