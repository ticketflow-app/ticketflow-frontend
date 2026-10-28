"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useOrganizerEvents, useCreateEvent, useUpdateEvent, usePublishEvent, useCancelEvent, useCreateVenue, useVenues, useCategories } from "@/features/events/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Play, Square } from "lucide-react";

import { addLocality } from "@/features/events/api";

import type { EventDetail } from "@/lib/api/types";

interface OrganizerEvent {
  id: string;
  title: string;
  status: string;
  date: string;
  city: string;
  venueName: string | null;
  categoryName: string | null;
  minPrice: number | null;
  imageUrl: string | null;
  ratingAverage: number;
  ratingCount: number;
}

export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<OrganizerEvent | null>(null);
  
  const { data: events, isPending, isError, refetch } = useOrganizerEvents();
  const { mutate: createEvent, isPending: creating } = useCreateEvent();
  const { mutate: updateEvent, isPending: updating } = useUpdateEvent();
  const { mutate: publishEvent, isPending: publishing } = usePublishEvent();
  const { mutate: cancelEvent, isPending: cancelling } = useCancelEvent();
  const { data: venues = [], isPending: venuesLoading } = useVenues();
  const { data: categories = [], isPending: categoriesLoading } = useCategories();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    venueId: "",
    date: "",
    imageUrl: "",
    localities: [{ name: "", price: 0, capacity: 0 }],
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      categoryId: "",
      venueId: "",
      date: "",
      imageUrl: "",
      localities: [{ name: "", price: 0, capacity: 0 }],
    });
    setEditingEvent(null);
    setShowCreateForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.role || !["organizador", "admin"].includes(user.role)) {
      return;
    }
    
    const payload: any = {
      title: formData.title,
      description: formData.description || undefined,
      categoryId: formData.categoryId,
      venueId: formData.venueId,
      date: formData.date ? (formData.date.includes("Z") ? formData.date : formData.date + ":00Z") : formData.date,
    };
    
    if (formData.imageUrl && formData.imageUrl.trim() !== "") {
      payload.imageUrl = formData.imageUrl.trim();
    }

    if (editingEvent) {
      updateEvent(
        { eventId: editingEvent.id, input: payload },
        {
          onSuccess: () => {
            resetForm();
            refetch();
          },
        }
      );
    } else {
      createEvent(payload, {
        onSuccess: (created: EventDetail) => {
          // backend NO acepta localidades en POST /eventos; se agregan aparte
          formData.localities.forEach((loc) => {
            if (loc.name.trim() && (loc.price > 0 || loc.capacity > 0)) {
              addLocality(created.id, { name: loc.name, price: loc.price, capacity: loc.capacity }).catch(() => undefined);
            }
          });
          resetForm();
          refetch();
        },
        onError: (err) => console.error("createEvent error", err),
      });
    }
  };

  const handlePublish = (eventId: string) => {
    publishEvent(eventId, {
      onSuccess: () => refetch(),
    });
  };

  const handleCancel = (eventId: string) => {
    cancelEvent(eventId, {
      onSuccess: () => refetch(),
    });
  };

  if (!user?.role || !["organizador", "admin"].includes(user.role)) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Acceso denegado. Requiere rol de organizador o admin.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Panel de Organizador</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus eventos, recintos y categorías.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showCreateForm ? "Cancelar" : "Crear Evento"}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}</CardTitle>
            <CardDescription>
              Completa los campos para {editingEvent ? "actualizar" : "crear"} tu evento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej. Concierto de Verano"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="venue">Recinto</Label>
                  <select
                    id="venue"
                    value={formData.venueId}
                    onChange={(e) => setFormData(prev => ({ ...prev, venueId: e.target.value }))}
                    className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Selecciona un recinto</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>{venue.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe tu evento..."
                    rows={3}
                    className="mt-1 h-24 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="imageUrl">URL de Imagen (opcional)</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Localidades</h3>
                {formData.localities.map((locality, index) => (
                  <div key={index} className="flex gap-4 items-end mb-4">
                    <div className="flex-1">
                      <Label htmlFor={`locality-name-${index}`}>Nombre</Label>
                      <Input
                        id={`locality-name-${index}`}
                        value={locality.name}
                        onChange={(e) => {
                          const newLocalities = [...formData.localities];
                          newLocalities[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, localities: newLocalities }));
                        }}
                        placeholder="Ej. General"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`locality-price-${index}`}>Precio ($)</Label>
                      <Input
                        id={`locality-price-${index}`}
                        type="text"
                        inputMode="numeric"
                        value={locality.price ? new Intl.NumberFormat('es-CO').format(locality.price).replace(/,/g, '.') : ''}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\./g, '').replace(/,/g, '');
                          const num = parseFloat(raw) || 0;
                          const newLocalities = [...formData.localities];
                          newLocalities[index].price = num;
                          setFormData(prev => ({ ...prev, localities: newLocalities }));
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`locality-capacity-${index}`}>Capacidad</Label>
                      <Input
                        id={`locality-capacity-${index}`}
                        type="text"
                        inputMode="numeric"
                        value={locality.capacity ? new Intl.NumberFormat('es-CO').format(locality.capacity) : ''}
                        onChange={(e) => {
                          // Strip all non-digit characters
                          const raw = e.target.value.replace(/[^0-9]/g, '');
                          // Remove leading zeros but keep at least one digit if empty
                          const stripped = raw.replace(/^0+/, '') || '0';
                          const num = parseInt(stripped) || 0;
                          const newLocalities = [...formData.localities];
                          newLocalities[index].capacity = num;
                          setFormData(prev => ({ ...prev, localities: newLocalities }));
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newLocalities = formData.localities.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, localities: newLocalities }));
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      localities: [...prev.localities, { name: "", price: 0, capacity: 0 }],
                    }));
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Localidad
                </Button>
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  type="submit"
                  disabled={creating || updating}
                >
                  {creating || updating ? "Guardando..." : editingEvent ? "Actualizar Evento" : "Crear Evento"}
                </Button>
                {editingEvent && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Mis Eventos</CardTitle>
          <CardDescription>
            Lista de todos los eventos que has creado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertDescription>No se pudieron cargar tus eventos.</AlertDescription>
            </Alert>
          ) : events?.content.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tienes eventos todavía.</p>
          ) : (
            <div className="space-y-4">
              {events?.content.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {event.date ? new Date(event.date).toLocaleString() : 'Fecha no definida'} • {event.city} • {event.venueName || 'Sin recinto'}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={event.status === 'PUBLICADO' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                      {event.minPrice && (
                        <Badge variant="outline">
                          Desde ${event.minPrice.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingEvent(event as OrganizerEvent);
                        setFormData({
                          title: event.title,
                          description: '',
                          categoryId: '',
                          venueId: '',
                          date: event.date || '',
                          imageUrl: event.imageUrl || '',
                          localities: [],
                        });
                        setShowCreateForm(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    {event.status !== 'PUBLICADO' && (
                      <Button
                        size="sm"
                        onClick={() => handlePublish(event.id)}
                        disabled={publishing}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Publicar
                      </Button>
                    )}
                    {event.status === 'PUBLICADO' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancel(event.id)}
                        disabled={cancelling}
                      >
                        <Square className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardHeader>
          <CardTitle>Recintos</CardTitle>
          <CardDescription>
            Administra tus recintos para eventos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Los recintos son datos de referencia (semilla V4/V5); no se crean por API.</p>
          {venues.map((venue) => (
            <div key={venue.id} className="flex items-center justify-between p-4 border rounded-lg mb-2">
              <div>
                <h3 className="font-medium">{venue.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {venue.city} • Capacidad: {venue.capacity}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}