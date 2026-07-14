import { createFileRoute } from '@tanstack/react-router'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, MapPin, Video, Check, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useEntranceAnimation } from '@/hooks/useAnime'

export const Route = createFileRoute('/_app/events/')({
  component: EventsPage,
})

function EventsPage() {
  const gridRef = useEntranceAnimation([])
  const utils = trpc.useUtils()
  const { data: upcoming, isLoading } = trpc.event.upcoming.useQuery()

  const rsvpMutation = trpc.event.rsvp.useMutation({
    onSuccess: () => {
      utils.event.upcoming.invalidate()
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="le-headline text-3xl font-extrabold">
          LE <span>Events</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Reunions, workshops, city-chapter meetups and more.</p>
      </div>

      <section>
        <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-4">Upcoming</h2>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
          </div>
        ) : (
          <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming?.map((event) => {
              const isRsvpd = event.userRsvpStatus === 'attending'
              const isPending = rsvpMutation.isPending && rsvpMutation.variables?.eventId === event.id

              return (
                <div
                  key={event.id}
                  className="opacity-0 rounded-xl border border-border/50 bg-card le-surface overflow-hidden hover:border-accent/30 transition-colors group"
                >
                  {event.coverUrl ? (
                    <img src={event.coverUrl} alt={event.title} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="h-36 bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                      <CalendarDays className="h-10 w-10 text-accent/30" />
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <p className="font-semibold text-sm line-clamp-2 text-foreground">{event.title}</p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      {formatDate(event.startsAt)}
                    </div>

                    {event.isOnline ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Video className="h-3.5 w-3.5 shrink-0" />Online
                      </div>
                    ) : event.venue ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />{event.venue}
                      </div>
                    ) : null}

                    {event.rsvpCount > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                        <Users className="h-3 w-3" />
                        {event.rsvpCount} attending
                      </div>
                    )}

                    <Button
                      size="sm"
                      className="w-full mt-1 gap-1.5"
                      variant={isRsvpd ? 'outline' : 'default'}
                      onClick={() =>
                        rsvpMutation.mutate({
                          eventId: event.id,
                          status: isRsvpd ? 'not_attending' : 'attending',
                        })
                      }
                      disabled={isPending}
                    >
                      {isRsvpd && <Check className="h-3.5 w-3.5 text-accent" />}
                      {isRsvpd ? 'RSVPd' : 'RSVP'}
                    </Button>
                  </div>
                </div>
              )
            })}
            {upcoming?.length === 0 && (
              <p className="col-span-3 text-center text-muted-foreground py-16">No upcoming events. Check back soon.</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
