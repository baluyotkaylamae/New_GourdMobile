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
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [successRate, setSuccessRate] = useState(null);
  const [error, setError] = useState(null);
  const context = useContext(AuthGlobal);

  useEffect(() => {
    if (context.stateUser.isAuthenticated === true) {
      fetchMonthlyStats();
      fetchSuccessRate();
    }
  }, [context.stateUser.isAuthenticated]);

  const fetchMonthlyStats = async () => {
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
        const monthlyDataMap = {};

        response.data.forEach((record) => {
          if (record.status !== 'Completed') return;

          const date = new Date(record.dateOfPollination);
          const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
          const plotNo = record.plotNo || 'Unknown Plot';
          const gourdType = record.gourdType?.name || 'Unknown Gourd Type';
          const variety = record.variety?.name || 'Unknown Variety';

          if (!monthlyDataMap[plotNo]) {
            monthlyDataMap[plotNo] = {};
          }

          if (!monthlyDataMap[plotNo][gourdType]) {
            monthlyDataMap[plotNo][gourdType] = {};
          }

          if (!monthlyDataMap[plotNo][gourdType][variety]) {
            monthlyDataMap[plotNo][gourdType][variety] = {};
          }

          if (monthlyDataMap[plotNo][gourdType][variety][monthYear]) {
            monthlyDataMap[plotNo][gourdType][variety][monthYear] += record.pollinatedFlowers || 0;
          } else {
            monthlyDataMap[plotNo][gourdType][variety][monthYear] = record.pollinatedFlowers || 0;
          }
        });

        const formattedData = Object.keys(monthlyDataMap).map((plotNo) => {
          const gourdTypesData = Object.keys(monthlyDataMap[plotNo]).map((gourdType) => {
            const varietiesData = Object.keys(monthlyDataMap[plotNo][gourdType]).map((variety) => {
              const plotData = Object.keys(monthlyDataMap[plotNo][gourdType][variety]).map((key) => ({
                value: monthlyDataMap[plotNo][gourdType][variety][key],
                dataPointText: monthlyDataMap[plotNo][gourdType][variety][key].toString(),
                label: key
              }));

              plotData.sort((a, b) => {
                const [monthA, yearA] = a.label.split('-');
                const [monthB, yearB] = b.label.split('-');

                return yearA === yearB
                  ? monthA - monthB
                  : yearA - yearB;
              });

              return { variety, data: [{ value: 0, label: '' }, ...plotData] };
            });

            return { gourdType, varietiesData };
          });

          return { plotNo, gourdTypesData };
        });

        setMonthlyStats(formattedData);
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
        const totalPollinatedFlowers = completedRecords.reduce((sum, record) => sum + (record.pollinatedFlowers || 0), 0);
        const totalFruitsHarvested = completedRecords.reduce((sum, record) => sum + (record.fruitsHarvested || 0), 0);

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
      {monthlyStats.map((plotData, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <Text style={styles.header}>Monthly Pollinated Flowers - Plot No.{plotData.plotNo}</Text>
            {plotData.gourdTypesData && plotData.gourdTypesData.map((gourdData, gourdIndex) => (
              <View key={gourdIndex}>
                <Text style={styles.subHeader}>Gourd Type: {gourdData.gourdType}</Text>
                {gourdData.varietiesData && gourdData.varietiesData.map((varietyData, varietyIndex) => (
                  <View key={varietyIndex}>
                    <Text style={styles.subHeader}>Variety: {varietyData.variety}</Text>
                    <ScrollView horizontal>
                      <View>
                        <LineChart
                          initialSpacing={0}
                          data={varietyData.data}
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
                          width={screenWidth + varietyData.data.length * 30} // Adjusted width for scrolling
                        />
                      </View>
                    </ScrollView>
                  </View>
                ))}
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