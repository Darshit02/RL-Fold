'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { jobsApi } from '@/lib/api'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const AA_REGEX = /^[ACDEFGHIKLMNPQRSTVWY]+$/i

export function JobSubmitDialog({ open, onClose, onSuccess }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    sequence: '',
    target_property: 'thermostability',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Job name is required'
    if (!form.sequence.trim()) e.sequence = 'Sequence is required'
    else if (!AA_REGEX.test(form.sequence)) e.sequence = 'Only valid amino acid letters allowed'
    else if (form.sequence.length < 5) e.sequence = 'Minimum 5 residues'
    else if (form.sequence.length > 1000) e.sequence = 'Maximum 1000 residues'
    return e
  }

  function reset() {
    setForm({ name: '', sequence: '', target_property: 'thermostability' })
    setErrors({})
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      const res = await jobsApi.create({
        name: form.name.trim(),
        sequence: form.sequence.toUpperCase().trim(),
        target_property: form.target_property,
      })
      reset()
      onSuccess()
      onClose()
      router.push(`/jobs/${res.data.id}`)
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.detail || 'Failed to submit job' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        maxWidth: 520,
      }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
            New protein design job
          </DialogTitle>
          <DialogDescription style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            The RL agent will optimise your sequence for the selected target property.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>

          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
              JOB NAME
            </Label>
            <Input
              placeholder="e.g. thermostable-variant-1"
              value={form.name}
              onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })) }}
              style={{
                background: 'var(--bg-elevated)',
                border: `1px solid ${errors.name ? 'var(--red)' : 'var(--border)'}`,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
              }}
            />
            {errors.name && <span style={{ fontSize: '11px', color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{errors.name}</span>}
          </div>

          {/* Target property */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
              TARGET PROPERTY
            </Label>
            <Select
              value={form.target_property}
              onValueChange={v => { if (v) setForm(p => ({ ...p, target_property: v })) }}
            >
              <SelectTrigger style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
              }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
              }}>
                <SelectItem value="thermostability">Thermostability</SelectItem>
                <SelectItem value="solubility">Solubility</SelectItem>
                <SelectItem value="binding_affinity">Binding affinity</SelectItem>
                <SelectItem value="stability">General stability</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sequence */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
              AMINO ACID SEQUENCE
            </Label>
            <textarea
              placeholder="MKTAYIAKQRQISFVKSHFSRQLEERLGL..."
              value={form.sequence}
              rows={4}
              onChange={e => {
                setForm(p => ({ ...p, sequence: e.target.value.toUpperCase() }))
                setErrors(p => ({ ...p, sequence: '' }))
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${errors.sequence ? 'var(--red)' : 'var(--border)'}`,
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: 1.8,
                letterSpacing: '0.1em',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = errors.sequence ? 'var(--red)' : 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = errors.sequence ? 'var(--red)' : 'var(--border)'}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {errors.sequence
                ? <span style={{ fontSize: '11px', color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{errors.sequence}</span>
                : <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Valid chars: A C D E F G H I K L M N P Q R S T V W Y</span>
              }
              <span style={{ fontSize: '11px', color: form.sequence.length > 900 ? 'var(--red)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {form.sequence.length}/1000
              </span>
            </div>
          </div>

          {/* Server error */}
          {errors.submit && (
            <div style={{
              padding: '10px 12px', borderRadius: 8,
              background: 'rgba(255,77,77,0.08)',
              border: '1px solid rgba(255,77,77,0.2)',
              color: 'var(--red)', fontSize: '12px',
              fontFamily: 'var(--font-mono)',
            }}>
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              style={{
                background: 'var(--accent)',
                color: '#0a0a0a',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 500,
                border: 'none',
              }}
            >
              {submitting ? 'Submitting...' : 'Submit job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
