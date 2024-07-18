import { ArrowRight, Calendar, MapPin, Settings2, X } from "lucide-react";
import { Button } from "../../../components/button";
import { useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

interface DestinationAndDateStepProps {
  isGuestsInputOpen: boolean;
  openGuestsInput: () => void;
  closeGuestsInput: () => void;
  setDestination: (destination: string) => void;
  eventStartAndEndDates: DateRange | undefined;
  setEventStartAndEndDates: (eventStartAndEndDates: DateRange | undefined) => void;
}

export function DestinationAndDateStep(props: DestinationAndDateStepProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  function openDatePicker() {
    setIsDatePickerOpen(true);
  }

  function closeDatePicker() {
    setIsDatePickerOpen(false);
  }

  const displayedDate = props.eventStartAndEndDates && props.eventStartAndEndDates.from && props.eventStartAndEndDates.to
    ? `${format(props.eventStartAndEndDates.from, "d' de 'LLL")} até ${format(props.eventStartAndEndDates.to, "d' de 'LLL")}`
    : null

  return (
    <div className="h-16 bg-zinc-900 px-4 rounded-xl flex items-center shadow-shape gap-3">
      <div className='flex items-center gap-2 flex-1'>
        <MapPin className="size-5 text-zinc-400" />
        <input
          disabled={props.isGuestsInputOpen}
          type="text"
          placeholder="Para onde você vai?"
          className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
          onChange={event => props.setDestination(event.target.value)}
        />
      </div>
      
      <button onClick={openDatePicker} disabled={props.isGuestsInputOpen} className='flex items-center gap-2 text-left w-[240px]'>
        <Calendar className="size-5 text-zinc-400" />
        <span className="text-lg text-zinc-400 w-40 flex-1">
          {displayedDate || 'Quando?'}
        </span>
      </button>

      {isDatePickerOpen && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center'>
          <div className='rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold'>Selecione a data</h2>
                <button type='button' onClick={closeDatePicker}>
                  <X className='size-5 text-zinc-400' />
                </button>
              </div>
            </div>
            
            <DayPicker mode="range" selected={props.eventStartAndEndDates} onSelect={props.setEventStartAndEndDates} disabled={{before: new Date()}} />
          </div>
        </div>
      )}

      <div className='w-px h-6 bg-zinc-800' />

      {props.isGuestsInputOpen ? (
        <Button onClick={props.closeGuestsInput} variant="secondary">
          Alterar local/data
          <Settings2 className="size-5" />  
        </Button>
      ) : (
        <Button onClick={props.openGuestsInput}>
          Continuar
          <ArrowRight className="size-5" />  
        </Button>
      )}
    </div>
  );
}