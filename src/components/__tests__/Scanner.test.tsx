import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Scanner from '../Scanner'

jest.mock('react-webcam', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-webcam">Webcam Mock</div>,
}))

describe('Scanner Component', () => {
  it('renders scanner component', () => {
    render(<Scanner />)
    expect(screen.getByTestId('mock-webcam')).toBeInTheDocument()
  })
})
