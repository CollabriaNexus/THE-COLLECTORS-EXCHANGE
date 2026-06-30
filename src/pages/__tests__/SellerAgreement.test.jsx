import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import SellerAgreement from '../SellerAgreement'

describe('SellerAgreement', () => {
  it('renders seller agreement heading', () => {
    render(<HelmetProvider><SellerAgreement /></HelmetProvider>)
    expect(screen.getByText('Seller Agreement')).toBeInTheDocument()
  })
})
