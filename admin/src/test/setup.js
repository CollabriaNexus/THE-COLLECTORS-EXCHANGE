import '@testing-library/jest-dom'
import { vi } from 'vitest'
window.scrollTo = vi.fn()
window.alert = vi.fn()
