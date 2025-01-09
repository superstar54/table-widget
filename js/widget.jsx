import { createRender, useModelState } from "@anywidget/react";
import "./widget.css";

import React, { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Button from '@mui/material/Button';

function MyTable({ data, columns, config, onRowUpdate, onRowClick, onButtonClick, onRowSelectionChange, style }) {
  const [rows, setRows] = useState(() => {
    // if one of the columns is a date or datetime, convert it Date object
    const dateColumns = columns.filter((col) => col.type === "date" || col.type === "datetime");
    if (dateColumns.length > 0) {
      data = data.map((row) => {
        dateColumns.forEach((col) => {
          row[col.field] = new Date(row[col.field]);
        });
        return row;
      });
    }
    return data.map((r, i) => ({ id: i, ...r }));
  });

  useEffect(() => {
    // Add unique `id` to each row if not present
    if (data[0] && !data[0].id) {
      data = data.map((r, i) => ({ id: i, ...r }));
    }
    // if one of the columns is a date or datetime, convert it Date object
    const dateColumns = columns.filter((col) => col.type === "date" || col.type === "datetime");
    if (dateColumns.length > 0) {
      data = data.map((row) => {
        dateColumns.forEach((col) => {
          row[col.field] = new Date(row[col.field]);
        });
        return row;
      });
    }
    setRows(data);
  }, [data, config]);

  useEffect(() => {
    // Dynamically update the CSS variable for font size
    if (style.fontSize) {
      document.documentElement.style.setProperty(
        "--table-widget-font-size",
        style.fontSize
      );
    }
  }, [style.fontSize]);

  const enhancedColumns = columns.map((col) => {
    if (col.dataType === "button") {
      return {
        ...col,
        renderCell: (params) => (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              console.log("Button clicked:", params.row.id, col.field);
              if (onButtonClick) {
                onButtonClick(params.row.id, col.field); // Invoke the parent-provided function
              }
            }}
          >
            {col.buttonLabel || "Click Me"} {/* Support custom button labels */}
          </Button>
        ),
        sortable: false,
        width: 150,
        editable: false,
      };
    }
    if (col.dataType === "link") {
      return {
        ...col,
        filterable: false,
        width: 100,
        editable: false,
        renderCell: (params) => {
          // Extract the link and text from the cell value
          const div = document.createElement("div");
          div.innerHTML = params.value;

          const anchor = div.querySelector("a");
          if (anchor) {
            return (
              <a href={anchor.href} target={anchor.target || "_blank"}>
                {anchor.textContent}
              </a>
            );
          }

          // Fallback if the value isn't valid HTML
          return params.value;
        },
      };
    }

    return col;
  });

  // Create the columnVisibilityModel
  const columnVisibilityModel = enhancedColumns.reduce((visibilityModel, col) => {
    visibilityModel[col.field] = !col.hide; // Set visibility to false if `hide` is true
    return visibilityModel;
  }, {});

  const handleProcessRowUpdate = (newRow, oldRow) => {
    const updatedRows = rows.map((row) => (row.id === newRow.id ? newRow : row));
    setRows(updatedRows);
    onRowUpdate(newRow);

    return newRow;
  };

  const handleRowClick = (params) => {
    onRowClick(params.row.id); // Send the row index or ID to the parent
  };

  const handleRowSelectionChange = (newSelection) => {
    console.log("Selection changed: ", newSelection);
    onRowSelectionChange(newSelection);
  };

  return (
    <div style={{ ...style }}>
      <DataGrid
        rows={rows}
        columns={enhancedColumns}
        initialState={{
          ...data.initialState,
          pagination: { paginationModel: { pageSize: config.pageSize} },
          columns: {
            columnVisibilityModel: columnVisibilityModel,
          },
        }}
        pageSizeOptions={[5, 10, 25, { value: -1, label: 'All' }]}
        pagination={config.pagination}
        autoPageSize={config.autoPageSize}
        checkboxSelection={config.checkboxSelection}
        disableSelectionOnClick={config.disableSelectionOnClick}
        onRowClick={handleRowClick} // Capture row clicks
        onRowSelectionModelChange={handleRowSelectionChange}
        editMode="cell"
        processRowUpdate={handleProcessRowUpdate}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
      />
    </div>
  );
}

const render = createRender(() => {
  const [data, setData] = useModelState("data");
  const [updatedRow, setUpdatedRow] = useModelState("updatedRow");
  const [selectedRowId, setSelectedRowId] = useModelState("selectedRowId");
  const [selectedRows, setSelectedRows] = useModelState("selectedRows");
  const [clickedButton, setClickedButton] = useModelState("clickedButton");
  const [columns, setColumns] = useModelState("columns");
  const [pageSize, setPageSize] = useModelState("pageSize");
  const [customStyle] = useModelState("style"); // Retrieve custom style from the model
  const [customConfig] = useModelState("config"); // Retrieve custom style from the model

  return (
    <MyTable
      data={data}
      columns={columns}
      pageSize={pageSize}
      style={customStyle}
      config={customConfig}
      onRowUpdate={(updatedRow) => {
        console.log("Updated row: ", updatedRow);
        setUpdatedRow(updatedRow);
      }}
      onRowClick={(rowId) => {
        console.log("Selected row index: ", rowId);
        setSelectedRowId(rowId); // Send the selected row index to Python
      }}
      onButtonClick={(rowId, field) => {
        console.log("Button clicked: ", rowId, field);
        setClickedButton({"rowId": rowId, "field": field}); // Send the selected row index to Python
      }}
      onRowSelectionChange={(selectedRows) => {
        console.log("Selected rows: ", selectedRows);
        setSelectedRows(selectedRows); // Send selected rows to Python
      }}
    />
  );
});

export default { render };
