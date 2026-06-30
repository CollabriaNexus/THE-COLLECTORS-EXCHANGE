import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginForm from '../LoginForm'

const mockSignInWithOtp = vi.fn()
const mockSignInWithPassword = vi.fn()
const mockVerifyOtp = vi.fn()
const mockResetPasswordForEmail = vi.fn()
const mockShowToast = vi.fn()

vi.mock('../../../utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: (...args) => mockSignInWithOtp(...args),
      signInWithPassword: (...args) => mockSignInWithPassword(...args),
      verifyOtp: (...args) => mockVerifyOtp(...args),
      resetPasswordForEmail: (...args) => mockResetPasswordForEmail(...args)
    }
  }
}))

vi.mock('../../Toast', () => ({
  useToast: () => mockShowToast
}))

const renderLoginForm = () => render(
  <BrowserRouter>
    <LoginForm />
  </BrowserRouter>
)

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email input with placeholder vip@example.com', () => {
    renderLoginForm()
    expect(screen.getByPlaceholderText('vip@example.com')).toBeInTheDocument()
  })

  it('renders mode toggle buttons', () => {
    renderLoginForm()
    expect(screen.getByText('Email OTP')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
  })

  it('renders Send Login Code button in OTP mode', () => {
    renderLoginForm()
    expect(screen.getByText('Send Login Code')).toBeInTheDocument()
  })

  it('switches to password mode', () => {
    renderLoginForm()
    fireEvent.click(screen.getByText('Password'))
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('shows password input in password mode', () => {
    renderLoginForm()
    fireEvent.click(screen.getByText('Password'))
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument()
  })

  it('handles email input change', () => {
    renderLoginForm()
    const input = screen.getByPlaceholderText('vip@example.com')
    fireEvent.change(input, { target: { value: 'test@test.com' } })
    expect(input.value).toBe('test@test.com')
  })

  it('submits OTP request', () => {
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null })
    renderLoginForm()
    fireEvent.change(screen.getByPlaceholderText('vip@example.com'), { target: { value: 'test@test.com' } })
    fireEvent.click(screen.getByText('Send Login Code'))
    expect(mockSignInWithOtp).toHaveBeenCalledWith({ email: 'test@test.com' })
  })

  it('submits password login', () => {
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null })
    renderLoginForm()
    fireEvent.click(screen.getByText('Password'))
    fireEvent.change(screen.getByPlaceholderText('vip@example.com'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByText('Sign In'))
    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'test@test.com', password: 'pass123' })
  })

  it('shows forgot password button', () => {
    renderLoginForm()
    fireEvent.click(screen.getByText('Password'))
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument()
  })

  it('shows OTP input after sending OTP', async () => {
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null })
    renderLoginForm()
    fireEvent.change(screen.getByPlaceholderText('vip@example.com'), { target: { value: 'test@test.com' } })
    fireEvent.click(screen.getByText('Send Login Code'))
    expect(await screen.findByPlaceholderText('123456')).toBeInTheDocument()
  })
})
