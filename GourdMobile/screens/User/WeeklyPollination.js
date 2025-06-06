import React, { useState, useEffect, useContext } from 'react';
import { View, Dimensions, StyleSheet, ScrollView, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import axios from 'axios';
import baseURL from '../../assets/common/baseurl';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

const WeeklyPollination = () => {
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [error, setError] = useState(null);
  const context = useContext(AuthGlobal);

  useEffect(() => {
    if (context.stateUser.isAuthenticated === true) {
      fetchWeeklyStats();
    }
  }, [context.stateUser.isAuthenticated]);

  const fetchWeeklyStats = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('jwt');
      if (!storedToken) {
        setError('No authentication token found');
        return;
      }

      const userId = context.stateUser?.user?.userId;
      if (!userId) {
        setError('User ID is missing');
        return;
      }

      const response = await axios.get(`${baseURL}Monitoring/${userId}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (Array.isArray(response.data)) {
        const weeklyDataMap = {};

        response.data.forEach((record) => {
          const date = new Date(record.dateOfPollination);
          const weekNumber = getWeekNumber(date);
          const year = date.getFullYear();
          const weekYear = `Week ${weekNumber} ${year}`;
          const plotNo = record.plotNo || 'Unknown Plot';
          const gourdType = record.gourdType?.name || 'Unknown Gourd Type';

          if (!weeklyDataMap[plotNo]) {
            weeklyDataMap[plotNo] = {};
          }

          if (!weeklyDataMap[plotNo][gourdType]) {
            weeklyDataMap[plotNo][gourdType] = {};
          }

          const pollinatedCount = Array.isArray(record.pollinatedFlowerImages) ? record.pollinatedFlowerImages.length : 0;

          if (weeklyDataMap[plotNo][gourdType][weekYear]) {
            weeklyDataMap[plotNo][gourdType][weekYear] += pollinatedCount;
          } else {
            weeklyDataMap[plotNo][gourdType][weekYear] = pollinatedCount;
          }
        });

        const formattedData = Object.keys(weeklyDataMap).map((plotNo) => {
          const gourdTypesData = Object.keys(weeklyDataMap[plotNo]).map((gourdType) => {
            const plotData = Object.keys(weeklyDataMap[plotNo][gourdType]).map((key, index) => ({
              value: weeklyDataMap[plotNo][gourdType][key],
              label: key,
              frontColor: getRandomColor(index),
            }));

            plotData.sort((a, b) => {
              const [weekA, yearA] = a.label.split(' ').slice(1);
              const [weekB, yearB] = b.label.split(' ').slice(1);

              return yearA === yearB
                ? weekA - weekB
                : yearA - yearB;
            });

            return { gourdType, data: plotData };
          });

          return { plotNo, gourdTypesData };
        });

        setWeeklyStats(formattedData);
        setError(null);
      } else {
        setError('Data is not in expected array format');
      }
    } catch (error) {
      setError('Failed to fetch statistics');
    }
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getRandomColor = (index) => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFF5'];
    return colors[index % colors.length];
  };

  return (
    <ScrollView>
      {weeklyStats.map((plotData, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <Text style={styles.header}>Weekly Pollinated Flowers - Plot No.{plotData.plotNo}</Text>
            {plotData.gourdTypesData && plotData.gourdTypesData.map((gourdData, gourdIndex) => (
              <View key={gourdIndex}>
                <Text style={styles.subHeader}>Gourd Type: {gourdData.gourdType}</Text>
                <ScrollView horizontal>
                  <View>
                    <BarChart
                      data={gourdData.data}
                      barWidth={30}
                      barBorderRadius={4}
                      yAxisColor="#0BA5A4"
                      xAxisColor="#0BA5A4"
                      xAxisLabelTextStyle={{ color: 'gray', fontSize: 8 }}
                      yAxisTextStyle={{ color: 'gray', fontSize: 10 }}
                      noOfSections={4}
                      width={screenWidth + (Array.isArray(gourdData.data) ? gourdData.data.length : 0) * 40}
                    />
                  </View>
                </ScrollView>
              </View>
            ))}
            {error && <Text style={styles.error}>{error}</Text>}
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default WeeklyPollination;