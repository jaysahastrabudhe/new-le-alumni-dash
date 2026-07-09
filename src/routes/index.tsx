import { createFileRoute, redirect } from '@tanstack/react-router'
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' })
  },
  component: () => null,
})
