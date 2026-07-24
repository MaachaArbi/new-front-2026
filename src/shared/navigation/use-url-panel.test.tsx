import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useUrlPanel } from './use-url-panel'

function Harness() {
  const panel = useUrlPanel('open')
  return (
    <div>
      <span data-testid="value">{panel.value ?? 'none'}</span>
      <span data-testid="isopen">{String(panel.isOpen)}</span>
      <button onClick={() => panel.open('x1')}>open</button>
      <button onClick={() => panel.close()}>close</button>
    </div>
  )
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Harness />
    </MemoryRouter>
  )
}

describe('useUrlPanel — état d’ouverture dans l’URL (ADR-F20.2)', () => {
  it('ouvre en écrivant le paramètre, ferme en le retirant', () => {
    renderAt('/')
    expect(screen.getByTestId('value')).toHaveTextContent('none')
    expect(screen.getByTestId('isopen')).toHaveTextContent('false')

    fireEvent.click(screen.getByText('open'))
    expect(screen.getByTestId('value')).toHaveTextContent('x1')
    expect(screen.getByTestId('isopen')).toHaveTextContent('true')

    fireEvent.click(screen.getByText('close'))
    expect(screen.getByTestId('value')).toHaveTextContent('none')
    expect(screen.getByTestId('isopen')).toHaveTextContent('false')
  })

  it('coller une URL avec le paramètre rouvre le panneau', () => {
    renderAt('/?open=abc')
    expect(screen.getByTestId('value')).toHaveTextContent('abc')
    expect(screen.getByTestId('isopen')).toHaveTextContent('true')
  })
})
