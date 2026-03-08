import pytest


@pytest.mark.asyncio
async def test_export_pdf_unauthenticated(client):
    response = await client.get("/api/v1/exports/00000000-0000-0000-0000-000000000000/pdf")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_export_excel_unauthenticated(client):
    response = await client.get("/api/v1/exports/00000000-0000-0000-0000-000000000000/excel")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_export_json_unauthenticated(client):
    response = await client.get("/api/v1/exports/00000000-0000-0000-0000-000000000000/json")
    assert response.status_code == 401
