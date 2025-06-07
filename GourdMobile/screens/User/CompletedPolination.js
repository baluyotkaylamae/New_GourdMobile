import React, { useState, useEffect, useContext } from 'react';
import { View, Dimensions, StyleSheet, ScrollView, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { LineChart } from 'react-native-gifted-charts';
import axios from 'axios';
import baseURL from '../../assets/common/baseurl';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [successRate, setSuccessRate] = useState(null);
  const [error, setError] = useState(null);
  const context = useContext(AuthGlobal);

  useEffect(() => {
    if (context.stateUser.isAuthenticated === true) {
      fetchWeeklyStats();
      fetchSuccessRate();
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
          if (record.status !== 'Completed') return;

          const date = new Date(record.dateOfFinalization || record.updatedAt || record.createdAt || record.dateOfPollination);
          const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
          const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}/${weekStart.getFullYear()}`;
          const plotNo = record.plotNo || 'Unknown Plot';
          const gourdType = record.gourdType?.name || 'Unknown Gourd Type';

          if (!weeklyDataMap[plotNo]) {
            weeklyDataMap[plotNo] = {};
          }

          if (!weeklyDataMap[plotNo][gourdType]) {
            weeklyDataMap[plotNo][gourdType] = {};
          }

          const pollinatedCount = Array.isArray(record.pollinatedFlowerImages) ? record.pollinatedFlowerImages.length : 0;

          if (weeklyDataMap[plotNo][gourdType][weekLabel]) {
            weeklyDataMap[plotNo][gourdType][weekLabel] += pollinatedCount;
          } else {
            weeklyDataMap[plotNo][gourdType][weekLabel] = pollinatedCount;
          }
        });

        const formattedData = Object.keys(weeklyDataMap).map((plotNo) => {
          const gourdTypesData = Object.keys(weeklyDataMap[plotNo]).map((gourdType) => {
            const plotData = Object.keys(weeklyDataMap[plotNo][gourdType]).map((key) => ({
              value: weeklyDataMap[plotNo][gourdType][key],
              dataPointText: weeklyDataMap[plotNo][gourdType][key].toString(),
              label: key
            }));

            plotData.sort((a, b) => new Date(a.label) - new Date(b.label));

            return { gourdType, data: [{ value: 0, label: '' }, ...plotData] };
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

  const fetchSuccessRate = async () => {
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
        const completedRecords = response.data.filter(record => record.status === 'Completed');
        const totalPollinatedFlowers = completedRecords.reduce(
          (sum, record) => sum + (Array.isArray(record.pollinatedFlowerImages) ? record.pollinatedFlowerImages.length : 0), 0
        );
        const totalFruitsHarvested = completedRecords.reduce(
          (sum, record) => sum + (Array.isArray(record.fruitHarvestedImages) ? record.fruitHarvestedImages.length : 0), 0
        );

        const rate = totalPollinatedFlowers > 0 ? (totalFruitsHarvested / totalPollinatedFlowers) * 100 : 0;
        setSuccessRate(rate.toFixed(2));
        setError(null);
      } else {
        setError('Data is not in expected array format');
      }
    } catch (error) {
      setError('Failed to fetch success rate');
    }
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
                    <LineChart
                      initialSpacing={0}
                      data={gourdData.data}
                      spacing={50}
                      textColor1="yellow"
                      textShiftY={-8}
                      textShiftX={-10}
                      textFontSize={13}
                      thickness={5}
                      hideRules
                      yAxisColor="#0BA5A4"
                      showVerticalLines
                      verticalLinesColor="rgba(14,164,164,0.5)"
                      xAxisColor="#0BA5A4"
                      color="#0BA5A4"
                      xAxisLabelTextStyle={{ color: 'gray', fontSize: 8 }}
                      yAxisTextStyle={{ color: 'gray', fontSize: 10 }}
                      yAxisLabelPrefix=""
                      yAxisLabelSuffix=""
                      noOfSections={4}
                      startAtZero
                      adjustForEmptyLabel={true}
                      width={screenWidth + (Array.isArray(gourdData.data) ? gourdData.data.length : 0) * 30}
                    />
                  </View>
                </ScrollView>
              </View>
            ))}
            {error && <Text style={styles.error}>{error}</Text>}
          </Card.Content>
        </Card>
      ))}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.header}>Success Rate of Manual Pollination</Text>
          <Text style={styles.successRate}>{successRate !== null ? `${successRate}%` : 'Loading...'}</Text>
          {error && <Text style={styles.error}>{error}</Text>}
        </Card.Content>
      </Card>
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
  successRate: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'green',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Dashboard;