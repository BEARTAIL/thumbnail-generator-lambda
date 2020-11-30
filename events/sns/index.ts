export function generateSnsEvent(topicName: string, message: string) {
  return {
    Records: [
      {
        EventSource: 'aws:sns',
        EventVersion: '1.0',
        EventSubscriptionArn: `arn:aws:sns:ap-northeast-1:203641281486:${topicName}`,
        Sns: {
          Type: 'Notification',
          MessageId: '95df01b4-ee98-5cb9-9903-4c221d41eb5e',
          TopicArn: `arn:aws:sns:ap-northeast-1:123456789012:${topicName}`,
          Subject: 'example subject',
          Message: message,
          Timestamp: '1970-01-01T00:00:00.000Z',
          SignatureVersion: '1',
          Signature: 'EXAMPLE',
          SigningCertUrl: 'EXAMPLE',
          UnsubscribeUrl: 'EXAMPLE',
          MessageAttributes: {
            Test: {
              Type: 'String',
              Value: 'TestString'
            },
            TestBinary: {
              Type: 'Binary',
              Value: 'TestBinary'
            }
          }
        }
      }
    ]
  };
}
