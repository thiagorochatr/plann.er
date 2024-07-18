import { Calendar, Plus, Tag, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../../components/button";
import { api } from "../../lib/axios";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { parseISO } from "date-fns";

type Trip = {
  id: string;
  destination: string;
  starts_at: string;
  ends_at: string;
  is_confirmed: boolean;
}

interface CreateActivityModalProps {
  trip: Trip | undefined;
  closeCreateActivityModal: () => void;
}

export function CreateActivityModal(props: CreateActivityModalProps) {
  const { tripId } = useParams<{ tripId: string }>();
  const [activityTitle, setActivityTitle] = useState<string>('')
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  function openDatePicker() {
    setIsDatePickerOpen(true);
  }
  function closeDatePicker() {
    setIsDatePickerOpen(false);
  }

  function formattedDateTimeToAPIRequestOccursAt(): Date {
    if(!date || !time){
      return new Date()
    }
    const dateTime = new Date(date!)
    const [hour, minute] = time!.split(':').map(Number)
    dateTime.setHours(hour)
    dateTime.setMinutes(minute)

    return dateTime
  }

  async function createActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await api.post(`/trips/${tripId}/activities`, {
      title: activityTitle, 
      occurs_at: formattedDateTimeToAPIRequestOccursAt()
    }).then(() => {
      props.closeCreateActivityModal();
      window.document.location.reload();
    });
  }

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center'>
      <div className='w-[640px] rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Cadastrar atividade</h2>
            <button type='button' onClick={props.closeCreateActivityModal}>
              <X className='size-5 text-zinc-400' />
            </button>
          </div>
          <p className='text-sm text-zinc-400'>
            Todos os convidados poderão visualizar as atividades.
          </p>
        </div>

        <form onSubmit={createActivity} className='space-y-3'>
        <div className='h-14 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2'>
          <Tag className='size-5 text-zinc-400' />
          <input
            name='title'
            onChange={e=>setActivityTitle(e.target.value)}
            placeholder="Qual a atividade?"
            className='bg-transparent text-lg placeholder-zinc-400 outline-none flex-1 text-left'
          />
        </div>

        <div className="flex items-center gap-2">
          <div className='h-14 flex-1 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2'>
            <Calendar className='size-5 text-zinc-400' />
            <button
              type="button"
              onClick={openDatePicker}
              className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1 pr-5 text-left"
            >
              {(date && time) ? `0${date.getDate()}`.slice(-2) + '/' + `0${date.getMonth() + 1}`.slice(-2)+` às ${time}` : "Data da atividade"}
            </button>
          
          </div>

          {isDatePickerOpen &&
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
              <div className="rounded-xl p-5 shadow-shape bg-zinc-900 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Selecione a Data</h2>
                    <button type="button" onClick={closeDatePicker}>
                      <X className="size-5 text-zinc-400"/>
                    </button>
                  </div>
                </div>
                <DayPicker
                  mode="single"
                  locale={ptBR}
                  selected={date}
                  onSelect={setDate}
                  fromDate={parseISO(props.trip!.starts_at)}
                  toDate={parseISO(props.trip!.ends_at)}
                />
                <div className='w-full flex justify-center text-2xl'>
                  <input className="bg-transparent" type="time" value={time} onChange={e=>setTime(e.target.value)}/>
                </div>
              </div>
            </div>
          }

        </div>
        <Button type="submit" variant="primary" size='full'>
          Salvar atividade
          <Plus className="size-5"/>
        </Button>
        </form>
      </div>
    </div>
  )
}