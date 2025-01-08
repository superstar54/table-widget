from __future__ import annotations

import importlib.metadata
import pathlib
import pandas as pd
import anywidget
import traitlets

try:
    __version__ = importlib.metadata.version("table_widget")
except importlib.metadata.PackageNotFoundError:
    __version__ = "unknown"


DEFAULT_STYLE = {}
DEFAULT_CONFIG = {
    "checkboxSelection": False,  # Disable checkbox selection by default
    "pagination": True,
    "autoPageSize": False,
    "pageSize": 10,
    "disableSelectionOnClick": False,
}


class TableWidget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "widget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"
    data = traitlets.List(traitlets.Dict()).tag(sync=True)
    columns = traitlets.List(traitlets.Dict()).tag(sync=True)
    style = traitlets.Dict().tag(sync=True)
    updatedRow = traitlets.Dict().tag(sync=True)
    selectedRows = traitlets.List(traitlets.Int()).tag(
        sync=True
    )  # Support multiple selections
    selectedRowId = traitlets.Int().tag(sync=True)  # Support single selection
    clickedButton = traitlets.Dict().tag(sync=True)
    config = traitlets.Dict().tag(sync=True)  # Configurable options for DataGrid

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Initialize the config with defaults if not provided
        self.config = {**DEFAULT_CONFIG, **kwargs.get("config", {})}

    def from_data(
        self,
        data: dict | pd.DataFrame,
        columns: list = None,
    ):
        if isinstance(data, pd.DataFrame):
            if columns is None:
                columns = [
                    {"field": str(col), "headerName": str(col), "editable": False}
                    for col in data.columns
                ]
            data = data.to_dict(orient="records")
        if len(data) > 1:
            if "id" not in data[0]:
                data = [{"id": i, **row} for i, row in enumerate(data)]
        self.data = data
        self.columns = columns
        if not self.style:
            self.style = DEFAULT_STYLE
