import styled from '@emotion/styled';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { RecordTable } from '@/ui/object/record-table/components/RecordTable';
import { TableOptionsDropdownId } from '@/ui/object/record-table/constants/TableOptionsDropdownId';
import { TableContext } from '@/ui/object/record-table/contexts/TableContext';
import { TableOptionsDropdown } from '@/ui/object/record-table/options/components/TableOptionsDropdown';
import { tableColumnsScopedState } from '@/ui/object/record-table/states/tableColumnsScopedState';
import { tableFiltersScopedState } from '@/ui/object/record-table/states/tableFiltersScopedState';
import { tableSortsScopedState } from '@/ui/object/record-table/states/tableSortsScopedState';
import { ViewBar } from '@/views/components/ViewBar';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { useView } from '@/views/hooks/useView';
import { ViewScope } from '@/views/scopes/ViewScope';
import { columnDefinitionsToViewFields } from '@/views/utils/columnDefinitionToViewField';
import { viewFieldsToColumnDefinitions } from '@/views/utils/viewFieldsToColumnDefinitions';
import { viewFiltersToFilters } from '@/views/utils/viewFiltersToFilters';
import { viewSortsToSorts } from '@/views/utils/viewSortsToSorts';

import { useObjectMetadataItemInContext } from '../hooks/useObjectMetadataItemInContext';
import { useUpdateOneObject } from '../hooks/useUpdateOneObject';
import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';

import { ObjectTableEffect } from './ObjectTableEffect';
import { ObjectRecordTableEffect } from './RecordTableEffect';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export type ObjectTableProps = Pick<
  ObjectMetadataItemIdentifier,
  'objectNamePlural'
>;

export const ObjectTable = ({ objectNamePlural }: ObjectTableProps) => {
  const { updateOneObject } = useUpdateOneObject({
    objectNamePlural,
  });
  const { columnDefinitions, foundObjectMetadataItem } =
    useObjectMetadataItemInContext();
  const tableScopeId = foundObjectMetadataItem?.namePlural ?? '';
  const viewScopeId = objectNamePlural ?? '';

  const { persistViewFields } = useViewFields(viewScopeId);
  const { setCurrentViewFields } = useView({
    viewScopeId,
  });

  const setTableColumns = useSetRecoilState(
    tableColumnsScopedState(tableScopeId),
  );

  const setTableFilters = useSetRecoilState(
    tableFiltersScopedState(tableScopeId),
  );

  const setTableSorts = useSetRecoilState(tableSortsScopedState(tableScopeId));

  const updateEntity = ({
    variables,
  }: {
    variables: {
      where: { id: string };
      data: {
        [fieldName: string]: any;
      };
    };
  }) => {
    updateOneObject?.({
      idToUpdate: variables.where.id,
      input: variables.data,
    });
  };

  return (
    <ViewScope
      viewScopeId={viewScopeId}
      onViewFieldsChange={(viewFields) => {
        setTableColumns(
          viewFieldsToColumnDefinitions(viewFields, columnDefinitions),
        );
      }}
      onViewFiltersChange={(viewFilters) => {
        setTableFilters(viewFiltersToFilters(viewFilters));
      }}
      onViewSortsChange={(viewSorts) => {
        setTableSorts(viewSortsToSorts(viewSorts));
      }}
    >
      <StyledContainer>
        <TableContext.Provider
          value={{
            onColumnsChange: useRecoilCallback(() => (columns) => {
              setCurrentViewFields?.(columnDefinitionsToViewFields(columns));
              persistViewFields(columnDefinitionsToViewFields(columns));
            }),
          }}
        >
          <ViewBar
            optionsDropdownButton={<TableOptionsDropdown />}
            optionsDropdownScopeId={TableOptionsDropdownId}
          />
          <ObjectTableEffect />
          <ObjectRecordTableEffect objectNamePlural={objectNamePlural} />
          <RecordTable updateEntityMutation={updateEntity} />
        </TableContext.Provider>
      </StyledContainer>
    </ViewScope>
  );
};
