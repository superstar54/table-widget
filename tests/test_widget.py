from table_widget import TableWidget
import pandas as pd


def test_widget():

    # Create a table widget
    table = TableWidget(style={"height": "500px"}, config={"pagination": True})

    # Generate data
    data = pd.DataFrame(
        {
            "name": ["Alice", "Bob", "Charlie"],
            "score": [85, 90, 78],
            "profile": [
                '<a href="https://example.com/alice" target="_blank">View Profile</a>',
                '<a href="https://example.com/bob" target="_blank">View Profile</a>',
                '<a href="https://example.com/charlie" target="_blank">View Profile</a>',
            ],
            "comment": ["Good", "Excellent", "Average"],
            "status": ["Active", "Inactive", "Active"],
        }
    )
    columns = [
        {"field": "name", "headerName": "Name", "editable": False},
        {
            "field": "score",
            "headerName": "Score",
            "dataType": "number",
            "editable": True,
        },
        {
            "field": "profile",
            "headerName": "Profile",
            "dataType": "link",
            "editable": False,
        },
        {"field": "comment", "headerName": "Comment", "editable": True},
        {
            "field": "status",
            "headerName": "Status",
            "type": "singleSelect",
            "valueOptions": ["Active", "Inactive"],
            "editable": True,
        },
    ]

    # Load data into the table
    table.from_data(data, columns=columns)
    table
