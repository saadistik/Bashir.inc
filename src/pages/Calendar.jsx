import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Calendar as CalendarIcon, Plus } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { supabase } from '../lib/supabase'

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [tussleDeadlines, setTussleDeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const location = useLocation()

  useEffect(() => {
    fetchCalendarData()
  }, [location.pathname])

  const fetchCalendarData = async () => {
    try {
      // Fetch calendar events
      const { data: eventsData, error: eventsError } = await supabase
        .from('calendar_events')
        .select('*')
        .order('date')

      if (eventsError) throw eventsError

      // Fetch tussle deadlines
      const { data: tusslesData, error: tusslesError } = await supabase
        .from('tussles')
        .select(`
          id,
          name,
          due_date,
          status,
          companies (name)
        `)
        .not('due_date', 'is', null)
        .order('due_date')

      if (tusslesError) throw tusslesError

      setEvents(eventsData || [])
      setTussleDeadlines(tusslesData || [])
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const calendarEvents = events.filter(e => e.date === dateStr)
    const deadlines = tussleDeadlines.filter(t => t.due_date === dateStr)
    return { calendarEvents, deadlines }
  }

  const hasEventsOnDate = (date) => {
    const { calendarEvents, deadlines } = getEventsForDate(date)
    return calendarEvents.length > 0 || deadlines.length > 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-panel p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Calendar</h1>
          <p className="text-slate-200">Track deadlines and events</p>
        </div>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="px-4 py-2 glass-button text-slate-200 rounded-xl hover:bg-white/20 transition-all"
            >
              Previous
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 glass-button text-slate-200 rounded-xl hover:bg-white/20 transition-all"
            >
              Today
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="px-4 py-2 glass-button text-slate-200 rounded-xl hover:bg-white/20 transition-all"
            >
              Next
            </motion.button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-slate-300 font-semibold py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Calendar Days */}
          {daysInMonth.map((date) => {
            const hasEvents = hasEventsOnDate(date)
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isCurrentDay = isToday(date)

            return (
              <motion.button
                key={date.toISOString()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(date)}
                className={`aspect-square rounded-xl p-2 transition-all relative ${
                  isSelected
                    ? 'bg-nature-teal/40 shadow-glow-teal'
                    : isCurrentDay
                    ? 'bg-nature-gold/30 border-2 border-nature-gold'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className={`text-sm font-medium ${
                  isSelected || isCurrentDay ? 'text-white' : 'text-slate-200'
                }`}>
                  {format(date, 'd')}
                </span>
                
                {hasEvents && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-nature-mint rounded-full"
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Selected Date Events */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h3>

          <div className="space-y-3">
            {(() => {
              const { calendarEvents, deadlines } = getEventsForDate(selectedDate)
              
              if (calendarEvents.length === 0 && deadlines.length === 0) {
                return (
                  <p className="text-slate-300 text-center py-4">No events or deadlines</p>
                )
              }

              return (
                <>
                  {deadlines.map((deadline) => (
                    <div
                      key={`deadline-${deadline.id}`}
                      className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium">{deadline.name}</p>
                          <p className="text-sm text-slate-300">{deadline.companies?.name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          deadline.status === 'completed'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {deadline.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {calendarEvents.map((event) => (
                    <div
                      key={`event-${event.id}`}
                      className="p-4 bg-nature-teal/10 border border-nature-teal/30 rounded-xl"
                    >
                      <p className="text-white font-medium">{event.title}</p>
                      {event.type && (
                        <span className="text-xs text-nature-mint">{event.type}</span>
                      )}
                    </div>
                  ))}
                </>
              )
            })()}
          </div>
        </motion.div>
      )}

      {/* Upcoming Deadlines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Upcoming Deadlines</h2>
        <div className="space-y-3">
          {tussleDeadlines.slice(0, 5).map((deadline) => (
            <motion.div
              key={deadline.id}
              whileHover={{ x: 5 }}
              className="glass-panel p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-white font-medium">{deadline.name}</p>
                <p className="text-sm text-slate-300">{deadline.companies?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-nature-gold font-medium">
                  {format(new Date(deadline.due_date), 'MMM d, yyyy')}
                </p>
                <span className={`text-xs ${
                  deadline.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {deadline.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
