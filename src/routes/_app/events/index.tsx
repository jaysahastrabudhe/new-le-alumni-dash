import { createFileRoute } from '@tanstack/react-router'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, MapPin, Video } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useEntranceAnimation } from '@/hooks/useAnime'

export const Route = createFileRoute('/_app/events/')({
  component: EventsPage,
})

function EventsPage() {
  const gridRef = useEntranceAnimation([])
  const { data: upcoming, isLoading } = trpc.event.upcoming.useQuery()
  const rsvpMutation = trpc.event.rsvp.useMutation()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="le-headline text-3xl font-extrabold">
          LE <span>Events</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Reunions, workshops, city-chapter meetups and more.</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : (
          <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming?.map((event: { id: string; title: string; startsAt: string; isOnline: boolean; venue?: string | null; coverUrl?: string | null; meetLink?: string | null }) => (
              <div key={event.id} className="opacity-0 rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors">
                {event.coverUrl && (
                  <img src={event.coverUrl} alt={event.title} className="h-36 w-full object-cover" />
                )}
                {!event.coverUrl && (
                  <div className="h-36 bg-gradient-to-br from-le-indigo to-primary flex items-center justify-center">
                    <CalendarDays className="h-12 w-12 text-white/30" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <p className="font-semibold text-sm line-clamp-2">{event.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(event.startsAt)}
                  </div>
                  {event.isOnline ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Video className="h-3.5 w-3.5" />Online
                    </div>
                  ) : event.venue && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />{event.venue}
                    </div>
                  )}
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'attending' })}
                    disabled={rsvpMutation.isPending}
                  >
                    RSVP
                  </Button>
                </div>
              </div>
            ))}
            {upcoming?.length === 0 && (
              <p className="col-span-3 text-center text-muted-foreground py-16">No upcoming events. Check back soon.</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
