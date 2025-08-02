import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Category } from '../../types';
import { useLayoutConfig } from '../../hooks/useOrientation';
import { getResponsivePadding, getResponsiveMargin } from '../../utils/responsive';
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
  const { categoryGrid } = useLayoutConfig();

  const renderCategory = ({ item }: { item: Category }) => (
    <CategoryCard category={item} onPress={onCategorySelect} />
  );

  const renderSeparator = () => <View style={[styles.separator, { height: categoryGrid.spacing }]} />;

  return (
    <FlatList
      data={categories}
      renderItem={renderCategory}
      keyExtractor={(item) => item.id}
      numColumns={categoryGrid.columns}
      columnWrapperStyle={categoryGrid.columns > 1 ? styles.row : undefined}
      contentContainerStyle={[styles.container, { padding: getResponsivePadding(16) }]}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ItemSeparatorComponent={renderSeparator}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: getResponsivePadding(32),
  },
  row: {
    justifyContent: 'space-between',
  },
  separator: {
    height: getResponsiveMargin(8),
  },
});

export default CategoryGrid;