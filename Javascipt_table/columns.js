export const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      filterable: true,
      width: '25%'
    },
    {
      key: 'age',
      label: 'Age',
      sortable: true,
      filterable: false,
      width: '10%'
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      width: '30%'
    },
    {
      key: 'joined',
      label: 'Joined',
      sortable: true,
      filterable: false,
      width: '20%',
      render: (value) => {
        const span = document.createElement('span');
        span.textContent = value;
  
        const date = new Date(value);
        if (date.getMonth() < 3) {
          span.style.color = 'blue'; 
        }
  
        return span;
      }
    }
  ];
  