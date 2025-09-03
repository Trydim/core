export function generateData() {
  const kanbanData = [];
  const BUG_TASKS = [
    'UI component not displaying images in IE browser',
    'Button not responding on hover action',
    'Text overlapping in mobile view',
    'Dropdown menu not functioning properly',
    'Form validation error',
    'Alignment issue in tables',
    'Column not loading completely',
    'Broken UI Designs',
    'Font size inconsistency',
    'UI element misaligned on scroll'
  ];
  const FEATURE_TASKS = [
    'Implement new user registration flow',
    'Add pagination to search results',
    'Improve accessibility for visually impaired users',
    'Create custom dashboard for users',
    'Develop user profile editing functionality',
    'Integrate with third-party API for weather data',
    'Implement social media sharing for articles',
    'Add support for multiple languages',
    'Create onboarding tutorial for new users',
    'Implement push notifications for mobile app'
  ];
  const EPIC_TASKS = [
    'Revamp UI design for entire application',
    'Develop mobile application for iOS and Android',
    'Create API for integration with external systems',
    'Implement machine learning algorithms for personalized recommendations',
    'Upgrade database infrastructure for scalability',
    'Integrate with payment gateway for subscription model',
    'Develop chatbot for customer support',
    'Implement real-time collaboration features for team projects',
    'Create analytics dashboard for administrators',
    'Introduce gamification elements to increase user engagement',
  ];

  const assignee = ['Andrew Fuller', 'Janet Leverling', 'Steven walker', 'Robert King', 'Margaret hamilt', 'Nancy Davloio', 'Margaret Buchanan', 'Laura Bergs', 'Anton Fleet', 'Jack Kathryn', 'Martin Davolio', 'Fleet Jack'];
  const status = ['Новый', 'Готов к запуску', ''];

  const types = ['Epic', 'Bug', 'Story' ];
  const count = 100000;
  for (let id = 1; id < count; id++) {
    const typeValue = types[Math.floor(Math.random() * types.length)];
    const summary = typeValue === 'Bug' ? BUG_TASKS[Math.floor(Math.random() * BUG_TASKS.length)]
                                        : typeValue === 'Story' ? FEATURE_TASKS[Math.floor(Math.random() * FEATURE_TASKS.length)]
                                                                : EPIC_TASKS[Math.floor(Math.random() * EPIC_TASKS.length)];

    const statusV = status[Math.floor(Math.random() * status.length)]

    kanbanData.push({
      Id: id,
      Type: typeValue,
      status: statusV,
      Status: statusV,
      userName: assignee[Math.floor(Math.random() * assignee.length)],
      customerName: assignee[Math.floor(Math.random() * assignee.length)],
      title: 'Task '+ id,
      Summary: summary,
      total: 19090,
      createDate: '10/10/2025 10:19',
      edited: '10/10/2024 10:19',
      lastEditDate: '10/10/2024 10:19',
    });
  }
  return kanbanData;
}
