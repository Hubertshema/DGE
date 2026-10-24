import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows } from '../../../theme';
import { Header, Badge, Button } from '../../../components/common';
import { MapPin, CheckCircle2, Plus } from 'lucide-react-native';

export const DeliveryAddressesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      district: 'Rwamagana',
      sector: 'Kigabiro',
      streetDetails: 'Near Rwamagana Central Market, Ave 4',
      isDefault: true,
    },
    {
      id: 'addr-2',
      district: 'Rwamagana',
      sector: 'Muhazi',
      streetDetails: 'Lake Muhazi View Road, Compound 12',
      isDefault: false,
    },
  ]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Delivery Addresses"
        subtitle="Saved Rwamagana Locations"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {addresses.map((item) => (
          <View key={item.id} style={styles.addressCard}>
            <View style={styles.cardHeader}>
              <View style={styles.locationTitleRow}>
                <MapPin size={18} color={colors.primary} />
                <Text style={styles.locationTitle}>
                  {item.district}, {item.sector}
                </Text>
              </View>
              {item.isDefault && <Badge label="Default" variant="success" />}
            </View>

            <Text style={styles.streetDetails}>{item.streetDetails}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.deliveryNote}>Standard Delivery Fee: 1,500 RWF</Text>
              {item.isDefault && (
                <View style={styles.activeCheck}>
                  <CheckCircle2 size={16} color={colors.primary} />
                  <Text style={styles.activeText}>Active at Checkout</Text>
                </View>
              )}
            </View>
          </View>
        ))}

        <Button
          title="Add New Rwamagana Address"
          variant="outline"
          icon={<Plus size={18} color={colors.primary} />}
          onPress={() => {}}
          style={styles.addBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  addressCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  streetDetails: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deliveryNote: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  activeCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  addBtn: {
    marginTop: spacing.sm,
  },
});
