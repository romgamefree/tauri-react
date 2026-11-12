use std::time::Duration;

use tiberius::{AuthMethod, Client, Config};
use tokio::{net::TcpStream, time::timeout};
use tokio_util::compat::TokioAsyncWriteCompatExt;

use crate::error::{AppError, AppResult};

use super::models::SqlServerConnection;

pub async fn test(settings: SqlServerConnection, password: String) -> AppResult<()> {
    let mut config = Config::new();
    config.host(settings.host.trim());
    config.port(settings.port);
    config.database(settings.database.trim());
    config.authentication(AuthMethod::sql_server(settings.username.trim(), password));
    if settings.trust_server_certificate {
        config.trust_cert();
    }

    timeout(Duration::from_secs(10), async {
        let tcp = TcpStream::connect(config.get_addr())
            .await
            .map_err(AppError::SqlServerTransport)?;
        tcp.set_nodelay(true)
            .map_err(AppError::SqlServerTransport)?;
        Client::connect(config, tcp.compat_write())
            .await
            .map_err(AppError::SqlServerProtocol)?;
        Ok(())
    })
    .await
    .map_err(|_| AppError::SqlServerTimeout)?
}
