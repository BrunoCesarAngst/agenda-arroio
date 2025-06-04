const SLACK_WEBHOOK_URLS = {
  development: import.meta.env.VITE_SLACK_WEBHOOK_DEV,
  staging: import.meta.env.VITE_SLACK_WEBHOOK_STAGING,
  production: import.meta.env.VITE_SLACK_WEBHOOK_PROD
};

class AlertService {
  constructor() {
    this.environment = import.meta.env.VITE_APP_ENV || 'development';
  }

  async sendSlackAlert(logEntry) {
    const webhookUrl = SLACK_WEBHOOK_URLS[this.environment];
    if (!webhookUrl) {
      console.error('Webhook URL não configurada para o ambiente:', this.environment);
      return;
    }

    const message = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `🚨 Alerta Crítico - ${this.environment.toUpperCase()}`,
            emoji: true
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Mensagem:*\n${logEntry.message}`
            },
            {
              type: "mrkdwn",
              text: `*Nível:*\n${logEntry.level}`
            }
          ]
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Timestamp:*\n${logEntry.timestamp}`
            },
            {
              type: "mrkdwn",
              text: `*URL:*\n${logEntry.url}`
            }
          ]
        }
      ]
    };

    if (logEntry.data && Object.keys(logEntry.data).length > 0) {
      message.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Dados Adicionais:*\n\`\`\`${JSON.stringify(logEntry.data, null, 2)}\`\`\``
        }
      });
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar alerta: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao enviar alerta para o Slack:', error);
    }
  }
}

export const alertService = new AlertService();