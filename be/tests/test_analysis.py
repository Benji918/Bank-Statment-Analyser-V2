import pytest


@pytest.mark.asyncio
async def test_run_analysis_unauthenticated(client):
    response = await client.post("/api/v1/analysis/00000000-0000-0000-0000-000000000000/run", json={})
    assert response.status_code == 401
