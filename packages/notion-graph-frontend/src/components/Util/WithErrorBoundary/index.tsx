/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
import React, { ComponentType, FC, memo } from "react"
import { ErrorInfo, PureComponent, ReactNode } from "react"

export const NullFallback: FC = () => null

export type ErrorBoundaryProps = {
  Fallback: ReactNode
}

export type ErrorBoundaryState = {
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends PureComponent<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: undefined, errorInfo: undefined }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
    /**
     * @todo log Sentry here
     */
  }

  public render(): ReactNode {
    if (this.state.error) return this.props.Fallback
    return this.props.children
  }
}

export function withErrorBoundary<Props>(Component: ComponentType<Props>) {
  return (Fallback = NullFallback) => {
    // eslint-disable-next-line react/display-name
    return memo(({ ...props }: Props) => {
      return (
        <ErrorBoundary Fallback={<Fallback {...props} />}>
          <Component {...props} />
        </ErrorBoundary>
      )
    })
  }
}
