import pytest


@pytest.mark.asyncio
async def test_upload_statement_unauthenticated(client):
    response = await client.post("/api/v1/statements/")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_statements_unauthenticated(client):
    response = await client.get("/api/v1/statements/")
    assert response.status_code == 401
