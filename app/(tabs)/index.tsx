import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Animated, Easing } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Event = {
  name: string;
  time: string;
};

type Day = {
  dateString: string;
};

type MarkedDate = {
  marked?: boolean;
  selected?: boolean;
  selectedColor?: string;
};

interface MonthChangeEvent {
  dateString: string;
}

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<{ [key: string]: Event[] }>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const onDayPress = (day: Day) => {
    setSelectedDate(day.dateString);
  };

  const onMonthChange = (month: { dateString: string }, direction: 'left' | 'right') => {
    const initialValue = direction === 'left' ? -100 : 100;
    slideAnim.setValue(initialValue);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();

    setCurrentMonth(month.dateString);
  };

  const addEvent = () => {
    if (selectedDate) {
      setIsModalVisible(true);
    } else {
      Alert.alert('Error', 'Por favor, selecciona una fecha antes de añadir un evento.');
    }
  };

  const saveEvent = async () => {
    if (selectedDate && newEventName && newEventTime) {
      const newEvent: Event = {
        name: newEventName,
        time: newEventTime,
      };

      const updatedEvents = {
        ...events,
        [selectedDate]: [...(events[selectedDate] || []), newEvent],
      };

      setEvents(updatedEvents);
      await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
      setIsModalVisible(false);
      setNewEventName('');
      setNewEventTime('');
    } else {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
    }
  };

  const updateEvent = async () => {
    if (selectedEvent && selectedDate) {
      const updatedEvents = { ...events };
      const eventIndex = updatedEvents[selectedDate].findIndex(
        (event) => event.name === selectedEvent.name && event.time === selectedEvent.time
      );

      if (eventIndex !== -1) {
        updatedEvents[selectedDate][eventIndex] = selectedEvent;
        setEvents(updatedEvents);
        await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
        setSelectedEvent(null);
      }
    }
  };

  const deleteEvent = async (eventToDelete: Event) => {
    if (selectedDate) {
      const updatedEvents = { ...events };
      updatedEvents[selectedDate] = updatedEvents[selectedDate].filter(
        (event) => event.name !== eventToDelete.name || event.time !== eventToDelete.time
      );

      setEvents(updatedEvents);
      await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
    }
  };

  const handleEditEventName = (text: string) => {
    if (selectedEvent) {
      setSelectedEvent({ ...selectedEvent, name: text });
    }
  };

  const handleEditEventTime = (text: string) => {
    if (selectedEvent) {
      setSelectedEvent({ ...selectedEvent, time: text });
    }
  };

  const getMarkedDates = () => {
    const markedDates: { [key: string]: MarkedDate } = {};
    Object.keys(events).forEach((date) => {
      if (events[date].length > 0) {
        markedDates[date] = { marked: true };
      }
    });
    if (selectedDate) {
      markedDates[selectedDate] = {
        ...markedDates[selectedDate],
        selected: true,
        selectedColor: '#FFA500',
      };
    }
    return markedDates;
  };

  const loadEvents = async () => {
    const savedEvents = await AsyncStorage.getItem('events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const renderEvents = () => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

      if (events[selectedDate] && events[selectedDate].length > 0) {
        return (
          <ScrollView>
            <Text style={styles.selectedDateText}>
              {date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            {events[selectedDate].map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <View style={styles.eventContent}>
                  <Text style={styles.eventText} numberOfLines={2} ellipsizeMode="tail">
                    {event.name}
                  </Text>
                  <Text style={styles.eventTime}>{event.time}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteEvent(event)} style={styles.deleteIcon}>
                  <MaterialIcons name="delete" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        );
      } else {
        return (
          <Text style={styles.noEventsText}>No hay eventos para este día.</Text>
        );
      }
    }
    return null;
  };

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={styles.container}
    >
      <View style={styles.calendarContainer}>
        <Animated.View
          style={{
            transform: [{ translateX: slideAnim }],
          }}
        >
          <Calendar
            style={styles.calendar}
            onDayPress={onDayPress}
            markedDates={getMarkedDates()}
            theme={{
              selectedDayBackgroundColor: '#FFA500',
              todayTextColor: '#FFA500',
              dotColor: '#FFA500',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
              arrowColor: '#FFA500',
              monthTextColor: '#FFA500',
              dayTextColor: '#FFFFFF',
              todayBackgroundColor: '#1a1a1a',
              textSectionTitleColor: '#FFA500',
              calendarBackground: '#000000',
            }}
            enableSwipeMonths={true}
            onMonthChange={(month: { dateString: string }) => {
              const newDate = new Date(month.dateString);
              const currentDate = new Date(currentMonth);
              const direction = newDate > currentDate ? 'left' : 'right';
              onMonthChange(month, direction);
            }}
          />
        </Animated.View>
      </View>
      <View style={styles.eventsContainer}>
        {renderEvents()}
      </View>
      <TouchableOpacity style={[styles.addButton, { backgroundColor: '#FFA500' }]} onPress={addEvent}>
        <MaterialIcons name="add" size={30} color="#000000" />
      </TouchableOpacity>
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcons name="event" size={24} color="#FFA500" style={{ marginRight: 10 }} />
              <Text style={styles.modalTitle}>Añadir Evento</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nombre del evento"
              value={newEventName}
              onChangeText={setNewEventName}
            />
            <TextInput
              style={styles.input}
              placeholder="Hora del evento"
              value={newEventTime}
              onChangeText={setNewEventTime}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveEvent}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {selectedEvent && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="edit" size={24} color="#FFA500" style={{ marginRight: 10 }} />
                <Text style={styles.modalTitle}>Editar Evento</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nombre del evento"
                value={selectedEvent?.name || ''}
                onChangeText={(text) => setSelectedEvent({ ...selectedEvent, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Hora del evento"
                value={selectedEvent?.time || ''}
                onChangeText={(text) => setSelectedEvent({ ...selectedEvent, time: text })}
              />
              <TouchableOpacity style={styles.saveButton} onPress={updateEvent}>
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => setSelectedEvent(null)}>
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedEvent(null)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  calendarContainer: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  calendar: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  selectedDateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventsContainer: {
    flex: 1,
  },
  eventItem: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventContent: {
    flex: 1,
    marginRight: 10,
  },
  eventText: {
    fontSize: 16,
    color: '#FFFFFF',
    flexShrink: 1,
  },
  eventTime: {
    fontSize: 14,
    color: '#FFA500',
  },
  deleteIcon: {
    marginLeft: 10,
  },
  noEventsText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FFA500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FFA500',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ff6347',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#ff6347',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedDateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFA500',
    textAlign: 'center',
    marginBottom: 20,
  },
});
