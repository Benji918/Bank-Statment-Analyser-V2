import pytest


@pytest.mark.asyncio
async def test_run_redaction_unauthenticated(client):
    response = await client.post("/api/v1/redaction/00000000-0000-0000-0000-000000000000/run")
    assert response.status_code == 401
