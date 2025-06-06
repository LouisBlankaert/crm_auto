import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { getAllReminders, updateReminderStatus } from '@/lib/actions/db-actions';
import { ReminderStatus } from '@/lib/generated/prisma';

export default async function RemindersPage() {
  // Récupération des données réelles depuis la base de données
  const reminders = await getAllReminders();

  // Trier les rappels par date (les plus récents d'abord) et par statut (TODO en premier)
  const sortedReminders = [...reminders].sort((a, b) => {
    // D'abord trier par statut (TODO avant DONE)
    if (a.status === 'TODO' && b.status !== 'TODO') return -1;
    if (a.status !== 'TODO' && b.status === 'TODO') return 1;
    
    // Ensuite trier par date
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-orange-500 to-amber-600 p-4 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-white">Rappels clients</h1>
        <Link 
          href="/reminders/new" 
          className="bg-white text-amber-600 hover:bg-gray-100 py-2 px-4 rounded-md shadow transition-all duration-200 font-medium"
        >
          Ajouter un rappel
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedReminders.length > 0 ? (
          sortedReminders.map((reminder) => (
            <Card key={reminder.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-amber-500">
              <CardContent className="p-0">
                <div className="p-6 flex flex-col md:flex-row justify-between">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-xl font-semibold mr-3 text-amber-700">
                        ⏰ {formatDate(reminder.date)}
                      </h3>
                      {reminder.status === ReminderStatus.TODO && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-sm">
                          À faire
                        </span>
                      )}
                      {reminder.status === ReminderStatus.DONE && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-400 to-green-500 text-white shadow-sm">
                          Effectué
                        </span>
                      )}
                      {reminder.status === ReminderStatus.POSTPONED && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-sm">
                          Reporté
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-2">
                      <Link 
                        href={`/${reminder.clientType}s/${reminder.clientId}`}
                        className="font-medium hover:underline text-indigo-600"
                      >
                        👤 {reminder.clientName}
                      </Link>
                    </p>
                    <p className="text-gray-600 bg-amber-50 p-2 rounded-md mt-1 inline-block">🧠 {reminder.reason}</p>
                    {reminder.notes && (
                      <p className="text-gray-600 mt-2 bg-gray-50 p-2 rounded-md border-l-2 border-gray-300">{reminder.notes}</p>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center">
                    <Link 
                      href={`/reminders/${reminder.id}/edit`}
                      className="bg-amber-600 text-white px-3 py-1 rounded-md hover:bg-amber-700 transition-colors duration-200 mr-2"
                    >
                      Modifier
                    </Link>
                    {reminder.status === ReminderStatus.TODO && (
                      <form action={async () => {
                        'use server';
                        await updateReminderStatus(reminder.id, ReminderStatus.DONE);
                      }}>
                        <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors duration-200">
                          Marquer comme effectué
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p>Aucun rappel programmé pour le moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
