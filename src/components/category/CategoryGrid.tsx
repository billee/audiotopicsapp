import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Category } from '../../types';
import CategoryCard from './CategoryCard';

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategorySelect,
  refreshing = false,
  onRefresh,
}) => {
  const renderCategory = ({ item }: { item: Category }) => (
    <CategoryCard category={item} onPress={onCategorySelect} />
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <FlatList
      data={categories}
      renderItem={renderCategory}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ItemSeparatorComponent={renderSeparator}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
  },
  separator: {
    height: 8,
  },
});

export default CategoryGrid;